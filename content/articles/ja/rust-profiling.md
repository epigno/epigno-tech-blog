---
title: Rustでのコードプロファイリング
description: Rustでコードをプロファイリングして、高速化を臨む
img: /img/rust/vostok-carrier-rocket.jpg
alt: Rocket
author:
  name: Malik Olivier Boussejra
  slug: olivier
  bio: CTO at Epigno
  img: /img/authors/pic-malik-olivier-boussejra.png
tags:
  - rust
---

仕事で重いRustのプログラムがあり、それを高速化しようとした。

Rustとは、C・C++と同様にシステム・プログラミング・言語であり、マシン言語（バイナリーコード）にコンパイルされる言語。
Rustのコンパイラは [rustc](https://github.com/rust-lang/rust) というコンパイラ。

Rustをプログラミングしたときに、基本生成したバイナリーコードが実行されたときの動的分析を行う。
C・C++と全く同じ手法を使っても問題ない。

当記事では、バイナリープログラムのプロファイリング手法を説明する。
うちは [valgrind](https://valgrind.org/) を使うことにしている。

## 高速化に当たる理念

コードを高速化するには、まずボトルネックを探す必要がある。
ソフトウェアが遅いとき、主なボトルネックがわずか数カ所に集中する傾向があるので、そのボトルネックを探して、適度に対応すれば結構の高速化になる場合が多い。
遅い箇所を見つたら、遅いコードを書き直すことで速いプログラムが得られる。

遅い箇所は関数レベルで探る。そのため、関数のコストを数値化し、関数のコール回数を調べる。

高速化を狙う場合、「単独コスト×コール回数」を最小化することが目的。
言い換えると、一回しか呼ばれていない関数が重くても、プログラム全体のコストと比較してその単独の関数のコストは無視できるならその関数はボトルネックとは言えない。
よくコールされている重い関数をまず狙ったほうがいい結果を期待できる。

## `valgrind` のインストール

Debian、Ubuntuなどを使う場合は下記のコマンドでインストール可能。

```sh
sudo apt-get install valgrind
```

次、関数の call graph を生成する `callgrind` という `valgrind` のツールを使う。

## `callgrind` の使い方

まず、バイナリーをビルドしよう。

```sh
cargo build --release
```

自分のプロジェクトが `my-binary` という名前なら、出力のバイナリーが `target/release/my-binary` というファイルに含まれる。


[callgrindのドキュメンテーション](https://valgrind.org/docs/manual/cl-manual.html)を参考にしながら進もう。

```sh
valgrind --tool=callgrind target/release/my-binary
```

これで、自分のバイナリーが実行される。
また、下記のように、任意な引数も追加できる。

```sh
valgrind --tool=callgrind target/release/my-binary arg1 arg2
```

実行中、進み具合を確認するため、`callgrind_control -b` というコマンドで実行中のコールスタックのスナップショットが閲覧可能。
`watch` を使うととても便利。

```sh
watch callgrind_control -b
```

これのような表示が見れる。

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

スナップショット時、スレッドが `core::ptr::const_ptr::<impl *const T>::is_null` という関数をまさに実行している。
また、スナップショット時、`nurse_shift::rules::get_unmatched_request`という関数が既に 12,985,059回実行されたことが確認できる。
結構の数ですね！！！

これで、いろんなスナップショットを見れば、うちのコードはどこの関数をよく実行しているかを質量的に確認できる。

実行終了後、`callgrind.out.9055`のようなファイルが生成される。そのファイルを `callgrind_annotate` で分析できる。

## `calgrind_annotate` で call graph を分析

ここからプロファイラーが作ってくれたグラフを分析して、ボトルネックを探し、高速化を得るための方法を検討する。

```sh
callgrind_annotate callgrind.out.9055 | less
```

下記のような出力がみれる。

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

上記の結果を見ると、全プロセスの32.61%、約3分の1は `<alloc::vec::Vec<T> as alloc::vec::SpecFromIter<T,I>>::from_iter` という関数の中で過ごしている。
また、13.76%も `nurse_shift::rules::match_nurse_requests_deficiencies` の中で過ごしている。
無視できる値ではない。
`from_iter`はRustのライブラリー内の関数なので、こちらは直接いじれないが、データ構造など変えるなど、`from_iter` のコールを避けるリファクタリングをしたら、莫大なパーフォーマンス改善が期待できる。
および、`match_nurse_requests_deficiencies` の実装を確認して、もっと軽い複雑を使ったアルゴリズムへの変更は検討できる。例えば、二次複雑度（`O(n²)`）のアルゴリズムを `O(n log(n))`に変えたら、パーフォーマンスを良くなると思われる。

いずれ、何かの変更をしたときに、ベンチマークやプロファイリングを使って期待しているパーフォーマンスアップを実現したかどうかを確認する必要がある。
加えて、単位テストでレグレッションの確認も欠かせない工程である。
これで安心して、速いコードが書ける。

実際、うちのソフトウェアで２つの関数のアルゴリズムの複雑度を`O(n²)`から `O(n log(n))`にすることで通常の使い方の範囲でプログラム全体が5倍速くなったという実例もある。
