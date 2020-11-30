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

`sudo apt-get install valgrind`

## `callgrind` の使い方
