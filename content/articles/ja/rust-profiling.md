---
title: valgrindを使ってRustのコードをプロファイリングする
description: valgrindを用いたRustのバイナリープログラムのプロファイリング手法を紹介します．
img: /img/rust/vostok-carrier-rocket.jpg
alt: Rocket
author:
  name: Malik Olivier Boussejra
  slug: olivier
  bio: CTO at Epigno
  img: /img/authors/pic-malik-olivier-boussejra.jpg
tags:
  - rust
---

CTOのOlivierです．

今回は，Rustのプログラムを高速化した話を記事にまとめました．

Rustは，C/C++と同じシステムプログラミング言語で，マシン言語（バイナリーコード）にコンパイルされるという特徴をもっていて，コンパイルには [rustc](https://github.com/rust-lang/rust) というコンパイラを使用します．

基本的にC/C++と同じ感覚でプログラミングすることが可能です．

当記事では，Rustのプロファイラである [valgrind](https://valgrind.org/) を用いたバイナリープログラムのプロファイリング手法を紹介します．

## 高速化の考え方

コードを高速化するには，まずボトルネックを見つける必要があります．
ソフトウェアの実行が遅いとき，主なボトルネックはわずか数カ所に集中するという傾向があります．
そのため，こういったボトルネックを見つけ出して適切に対処することにより大幅な高速化が見込めます．

ボトルネックは関数レベルで探していきます．
そこで，関数の計算コストを数値化し，関数のコール回数を調べるという手順を踏みます．

プログラムの高速化では，「関数の計算コスト×コール回数」を最小化することが目的となります．
言い換えると，1回しかコールされない関数の計算コストがひじょうに高いという場合，その計算コストがプログラム全体の計算コストと比較して無視できる範囲ならば，その関数はボトルネックとはいえないということになります．
すなわち，頻繁にコールされていて，かつ，計算コストが高い関数を狙って対処することで，より大きな高速化が期待できます．

関数の計算コストやコール回数を調べるためにプロファイラの `vargrind` を使用します．

## `valgrind` のインストール

DebianやUbuntuなどを使う場合は下記のコマンドでインストールが可能です．

```sh
sudo apt-get install valgrind
```

次に，関数の call graph を生成するために `callgrind` という `valgrind` のツールを使っていきます．

## `callgrind` の使い方

まず，プロファイリングしたいバイナリーをビルドします．

```sh
cargo build --release
```

自分のプロジェクトが `my-binary` という名前なら，出力のバイナリーが `target/release/my-binary` というファイルに含まれています．

[callgrindのドキュメンテーション](https://valgrind.org/docs/manual/cl-manual.html) を参考にしながら進みましょう．

```sh
valgrind --tool=callgrind target/release/my-binary
```

上記のコマンドで，自分で生成したバイナリーの call graph を生成することができます．
また，下記のように，任意の引数も追加することができます．

```sh
valgrind --tool=callgrind target/release/my-binary arg1 arg2
```

実行中に進捗を確認したい場合は `callgrind_control -b` というコマンドを実行することで，実行中のコールスタックのスナップショットを閲覧することも可能です．
ちなみに，リアルタイムで進捗を確認したい場合は `watch` コマンドを使うととても便利です．

```sh
watch callgrind_control -b
```

`callgrind_control -b` を実行すると下記のような結果が表示されます．

```
PID 9055: target/release/my-binary
  Frame: Backtrace for Thread 1
   [ 0]  core::ptr::const_ptr::<impl *const T>::is_null (36718722966 x)
   [ 1]  <core::slice::iter::Iter<T> as core::iter::traits::iterator::Iterator>::next (7656659436 x)
   [ 2]  <core::slice::iter::Iter<T> as core::iter::traits::iterator::Iterator>::find (12985059 x)
   [ 3]  nurse_shift::rules::get_unmatched_request (12985059 x)
   [ 4]  nurse_shift::rules::match_nurse_requests_deficiencies (102245 x)
   [ 5]  nurse_shift::solution::<impl nurse_shift::data_structures::Allocations>::deficiencies (102245 x)
   [ 6]  nurse_shift::solution::<impl nurse_shift::data_structures::Allocations>::score (89038 x)
   [ 7]  nurse_shift::solution::<impl nurse_shift::data_structures::Allocations>::do_move (1 x)
   [ 8]  nurse_shift::solve_with_options (1 x)
   [ 9]  nurse_shift::solve (1 x)
```

`[ 0]` の行は，
スナップショットを撮った瞬間，スレッドが `core::ptr::const_ptr::<impl *const T>::is_null` という関数をまさに実行していると解釈することができます．
また，`[ 3]` の行は，スナップショットを撮った瞬間，`nurse_shift::rules::get_unmatched_request`という関数が既に 12,985,059回実行されたと解釈することができます．

結構なコール回数ですね！！！

このようにして，いろいろなスナップショットを見れば，どの関数をどれだけ実行しているかを定量的に評価することができます．

このコマンドは `callgrind.out.9055` のようなファイルを生成します．このファイルは `callgrind_annotate` コマンドで分析することができます．

## `calgrind_annotate` で call graph を分析する

ここから，いよいよ分析にはいります．
プロファイラーが生成したグラフを基にボトルネックを探していきます．

```sh
callgrind_annotate callgrind.out.9055 | less
```

上記のコマンドを実行することで次のような結果が表示されます．

```
--------------------------------------------------------------------------------
Profile data file 'callgrind.out.9055' (creator: callgrind-3.16.1)
--------------------------------------------------------------------------------
I1 cache:
D1 cache:
LL cache:
Timerange: Basic block 0 - 201410050986
Trigger: Program termination
Profiled target:  target/release/my-binary (PID 164296, part 1)
Events recorded:  Ir
Events shown:     Ir
Event sort order: Ir
Thresholds:       99
Include dirs:
User annotated:
Auto-annotation:  on

--------------------------------------------------------------------------------
Ir
--------------------------------------------------------------------------------
796,344,143,930 (100.0%)  PROGRAM TOTALS

--------------------------------------------------------------------------------
Ir                        file:function
--------------------------------------------------------------------------------
259,667,600,162 (32.61%)  <alloc::vec::Vec<T> as alloc::vec::SpecFromIter<T,I>>::from_iter
109,539,950,687 (13.76%)  nurse_shift::rules::match_nurse_requests_deficiencies
 95,685,736,780 (12.02%)  chrono::naive::date::NaiveDate::checked_add_signed
 92,470,485,889 (11.61%)  alloc::slice::merge_sort
 23,383,992,804 ( 2.94%)  ./malloc/malloc.c:_int_free [/usr/lib/x86_64-linux-gnu/libc-2.32.so]
 20,002,442,673 ( 2.51%)  ./malloc/malloc.c:_int_malloc [/usr/lib/x86_64-linux-gnu/libc-2.32.so]
 16,074,100,013 ( 2.02%)  alloc::slice::insert_head
 15,719,791,404 ( 1.97%)  ./string/../sysdeps/x86_64/multiarch/memmove-vec-unaligned-erms.S:__memcpy_avx_unaligned_erms [/usr/lib/x86_64-linux-gnu/libc-2.32.so]
 15,590,654,669 ( 1.96%)  ./malloc/malloc.c:realloc [/usr/lib/x86_64-linux-gnu/libc-2.32.so]
 14,528,374,785 ( 1.82%)  time::duration::Duration::num_days
 11,539,380,914 ( 1.45%)  itertools::groupbylazy::GroupBy<K,I,F>::step
 10,394,828,259 ( 1.31%)  ./malloc/malloc.c:_int_realloc [/usr/lib/x86_64-linux-gnu/libc-2.32.so]
  9,494,444,515 ( 1.19%)  alloc::raw_vec::RawVec<T,A>::reserve
  4,728,948,979 ( 0.59%)  ./malloc/malloc.c:malloc [/usr/lib/x86_64-linux-gnu/libc-2.32.so]
  4,478,516,922 ( 0.56%)  itertools::groupbylazy::GroupInner<K,I,F>::step_buffering
```

上記の結果を見ると，全体の32.61%，つまり約3分の1の時間を `<alloc::vec::Vec<T> as alloc::vec::SpecFromIter<T,I>>::from_iter` という関数の実行に費やしているということが分かります．
また，13.76%もの時間を `nurse_shift::rules::match_nurse_requests_deficiencies` の実行に費やしていることが分かります．

これは無視できる値ではありませんね．

`from_iter`はRustの標準ライブラリー内の関数なので，こちらを直接いじることはできませんが，データ構造を変更するなどといった `from_iter` のコールを避けるリファクタリングをすることで，大幅なパーフォーマンス改善が期待できます．

その他に，`match_nurse_requests_deficiencies` の実装を確認して，もっと計算量の低いアルゴリズムへの変更も検討できます．たとえば，`O(n²)` のアルゴリズムを `O(n log(n))` に変更することで，`n` の値がひじょうに大きくなった場合にパフォーマンスの改善が見込めます．

事実，Epignoのソフトウェアで2つの関数のアルゴリズムの複雑度を `O(n²)` から `O(n log(n))` に変更したことでプログラム全体が5倍速くなったという実例もあります．

## まとめ

プロファイリングを実施することで，プログラムのボトルネックを効率的に見つけることができます．
これは，高速化の最初のステップとしてとても重要になります．

他にも，レグレッションテストも欠かせない工程ですね．

これで安心して，速いコードが書けます．
