---
title: Linuxで画面のバックライトをキーボードで操る
description: i3のキーボードショートカットでスクリーンのバックライトを自由自在に操ろう
img: /img/i3-screenshot.png
alt: "i3 screenshot with some Rust code and bashtop running in the background"
author:
  name: Malik Olivier Boussejra
  slug: olivier
  bio: CTO at Epigno
  img: /img/authors/pic-malik-olivier-boussejra.jpg
createdAt: 2022-01-27
updatedAt: 2022-02-11
tags:
  - trivia
---

当方は[新しいコンピュータ](https://system76.com/laptops/lemur)を購入しました。そこで、なれている環境を全部新しいコンピュータに移す必要がありました。
[System76](https://system76.com) のハードウェアなので、Linuxを自分でインストールする必要がなく、生産的な環境が用意できていました。
古いマシーンの dot files (`.gitconfig`, `.config`, `.bashrc`, `.thunderbird` など)
を全部新しいマシーンに `rsync` で送信し、すぐにいつも使っている環境と同じような環境が構築できました。

また、当方の好みで、[i3](https://i3wm.org/) というウィンドウマネージャを使っています。`i3`が軽い代償として、ウィンドウのタイリング以外の機能は全くありません。
そこで、System76が用意しているキーボードショートカット（音量設定キー、画面の輝度設定キーなど）は全部動きません。
無論、デフォルトのPopOSでは、特別な設定なく、すぐ使えます。

そこで、この記事で、画面の輝度設定キーの設定を紹介します。

## あらすじ

輝度設定キーは輝度を変更するカスタムなコマンドにバインディングすることで、`i3`で輝度設定キーが普通に使えるようになります。
まず、カスタムなバインディングを定義するため、輝度設定キーのシンボルを取得する必要があります。

## 輝度設定キーのシンボル(keysym)を取得

まず、キーボード上、輝度設定キーを目視しましょう。

![輝度設定キー](/img/system76-lemur-pro-keyboard.png)

Fn + F8 を必死に押しても反応しませんよね？

まず、キーが認識されていることを確認し、キーのシンボルを取得しましょう。

`xev` というプログラムを使います。`xev` はXサーバーのイベントを全部プリントします。
そのうち、どのキーを押したか、そのキーのコードネームみたいなシンボル（`keysym`といいます）をプリントします。

`xev` を起動してから、輝度ダウン・輝度アップのキーを押しましょう。下記のようなテキストデータが出力されます。

```
KeyPress event, serial 34, synthetic NO, window 0x4000001,
    root 0x7a8, subw 0x0, time 265851214, (360,568), root:(1324,588),
    state 0x0, keycode 232 (keysym 0x1008ff03, XF86MonBrightnessDown), same_screen YES,
    XLookupString gives 0 bytes:
    XmbLookupString gives 0 bytes:
    XFilterEvent returns: False

...

KeyPress event, serial 35, synthetic NO, window 0x4000001,
    root 0x7a8, subw 0x0, time 265852254, (360,568), root:(1324,588),
    state 0x0, keycode 233 (keysym 0x1008ff02, XF86MonBrightnessUp), same_screen YES,
    XLookupString gives 0 bytes:
    XmbLookupString gives 0 bytes:
    XFilterEvent returns: False
```

ここで、`XF86MonBrightnessDown` および `XF86MonBrightnessUp` の輝度ダウン・輝度アップキーのシンボルがあります。

そのキーにカスタムなコマンドをバインディングするため、見つけ出したkeysymは `i3` の設定ファイルの中で使います！

## 輝度を変更してみる

KernelのほとんどのドライバはファイルシステムAPIを提供しています。
輝度のドライバも同じです。
次のことはハードウェアに依ってドライバやパスが違いますが、原理に変わりはありません。

当方のPCは `intel_backlight` というドライバを使っており、ファイルシステムAPIは下記のディレクトリにあります。

```
/sys/class/backlight/intel_backlight
```

そこで、いつくかのファイルがあります。

```bash
$ cd /sys/class/backlight/intel_backlight
$ ls
actual_brightness  bl_power  brightness  device  max_brightness  power  scale  subsystem  type  uevent
# brightness と max_brightness は今回重要なファイルとなります。
$ cat max_brightness
48000
$ cat brightness
48000
# brightnessの 値は max_brightness と一緒なので、
# スクリーンの現在の輝度は最上限値であることがわかります

# さて、輝度を半分にしましょう
$ echo 24000 > brightness
bash: brightness: Permission denied # (T_T)
# 基本、brightness はrootでしかいじれないので、sudo と tee を使いましょう
$ echo 24000 | sudo tee brightness
# これで、画面が暗くなったはずです！
$ echo 0 | sudo tee brightness
# 0を書き込むと真っ暗になるので要注意
```

これを知った上で、輝度を変更するスクリプトを書きます。

## 輝度を変更するスクリプトを書く

`/usr/local/bin/backlight` に下記のスクリプトを入れます。

現在の輝度を読み取り、それを変えるスクリプトです。
輝度が必ず `1` と `max_brightness` の間にあるようにしています。

```bash
#!/usr/bin/env bash
set -e

CURRENT=$(cat '/sys/class/backlight/intel_backlight/brightness')
MAX=$(cat '/sys/class/backlight/intel_backlight/max_brightness')

if [ -z "$1" ]; then
	echo "Screen backlight brightess: $CURRENT / $MAX"
	echo "    Change brightness value with following command:"
	echo "    \$ $0 \$value"
	exit 1
fi

ARGV="$1"
if [ "${ARGV:0:1}" == "+" ]; then
	NEW_VALUE=$(("$CURRENT" + "${ARGV:1}"))
elif [ "${ARGV:0:1}" == "-" ]; then
	NEW_VALUE=$(("$CURRENT" - "${ARGV:1}"))
else
	NEW_VALUE="$ARGV"
fi

if [ "$NEW_VALUE" -gt "$MAX" ]; then
	NEW_VALUE="$MAX"
elif [ "$NEW_VALUE" -lt 1 ]; then
	NEW_VALUE=1
fi

echo "$NEW_VALUE" | tee '/sys/class/backlight/intel_backlight/brightness'
```

使ってみましょう。

```bash
$ backlight
Screen backlight brightess: 48000 / 48000
    Change brightness value with following command:
    $ /usr/local/bin/backlight $value
$ backlight -5000
bash: brightness: Permission denied
# brightnessに書き込むには root が要りますね
$ sudo backlight -5000
# 暗くなりました！
$ sudo backlight +5000
# 明るくなりました！
$ backlight
Screen backlight brightess: 43000 / 48000
    Change brightness value with following command:
    $ /usr/local/bin/backlight $value
```

ですが、`sudo` が必要なら、`i3` のバインディングで呼び出せないですね。
次は `sudo` が不要になるようにしましょう。

## 一般ユーザに `brightness` 書き込み権限を

`chmod` で `/sys/class/backlight/intel_backlight/brightness` への書き込み権限は付与できますが、再起動時で毎回実行する必要があるので、極めて不便です。

`udev` のルールでファイルシステムAPIのファイルの権限を随時に変えましょう。
`udev` はドライバをロードする役目を持つ、とても大事なプログラムです。

デバイスを差し込むときなど、ドライバロード時、任意なコマンドも実行できる設定は可能になっています。

`/lib/udev/rules.d/90-backlight.rules` で `backlight` のサブシステムに対するルールを作ります。

`90-backlight.rule` の中身は下記のテキストにすれば良いです。

```
ACTION=="add", SUBSYSTEM=="backlight", RUN+="/bin/chmod o+w /sys/class/backlight/%k/brightness"
```

これで、`backlight`のドライバをロードしたときと同時に、`/bin/chmod o+w /sys/class/backlight/%k/brightness` というコマンドが実行されます。
ちなみに `%k` はデバイスの kernel name に差し替えるものになります。

今回のハードウェアの `backlight` は `intel_backlight` という kernel name になっています。
ということで、下記のコマンドが実行されて、一般ユーザに書き込み権限を与えるコマンドとなっています。

```bash
chmod o+w /sys/class/backlight/intel_backlight/brightnes
```

システム再起動後、権限が変わったことを確認できます。前後比較をしましょう。

### 前

```bash
$ ls -l brightness
-rw-r--r-- 1 root root 4096 Jan 27 20:43 brightness
$ backlight -5000
bash: brightness: Permission denied
```

### 後

```bash
$ ls -l brightness
-rw-r--rw- 1 root root 4096 Jan 27 20:43 brightness
$ backlight -5000
# 一般ユーザ権限でも暗くなりました！成功！
```

これですべての条件が揃いましたので、あとは `i3` の設定ファイルでバインディングを定義するしかないです。

## 最後！キーバインディングを設定！

`~/.config/i3/config` に下記の2行を追加します。

```bash
# Screen backlight brightness control
bindsym XF86MonBrightnessDown exec backlight -5000
bindsym XF86MonBrightnessUp exec backlight +5000
```

`i3` のリロード後、さー！来ました！

輝度設定キーが使えるようになりました。

## まとめ

`xev` で 輝度キーの keysymの名称を調べ、
ファイルシステムAPIで輝度を変え、
輝度を変えるスクリプトを作成し、
`udev` でファイルシステムAPIの権限を変更し、
ようやく`i3`のキーバインディングが設定できました。

面白かったじゃないですか？
