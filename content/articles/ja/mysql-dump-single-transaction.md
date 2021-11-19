---
title: MySQLのデータベースをトランザクション内でダンプする
description: MySQLのデータベースをより安全にダンプするための方法を紹介します．
img: /img/mysql.png
alt: MySQL
author:
  name: Malik Olivier Boussejra
  slug: olivier
  bio: CTO at Epigno
  img: /img/authors/pic-malik-olivier-boussejra.jpg
createdAt: 2021-06-28
updatedAt: 2021-06-28
tags:
  - mysql
---

MySQLのデータベースをダンプする際，`mysqldump` の [`--single-transaction` フラグ](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html#option_mysqldump_single-transaction) を用いることで，ダンプ処理全体をトランザクションで囲むことができます．
今回，ダンプをトランザクションで囲むメリットについて話そうと思います．


MySQLでデータベースをダンプする際，[`mysqldump`](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) というユーティリティはよく使われます．
一般的に，下記のように使います．

```sh
mysqldump --result-file=output.sql databasename --user=username
```

`mysqldump` は，デフォルトでテーブルをロックしているってご存知でしたか？
`mysqldump` のドキュメンテーションを確認してみましょう．

> `mysqldump` requires at least the `SELECT` privilege for dumped tables,
> `SHOW VIEW` for dumped views, `TRIGGER` for dumped triggers,
> **`LOCK TABLES` if the `--single-transaction` option is not used**,
> and (as of MySQL 8.0.21) `PROCESS` if the `--no-tablespaces` option is not used.
> [引用者強調]

テーブルをロックすると，ダンプ中，他のSQLセッションはテーブルを読み取れません．無論，書き込みもできません．
ドキュメンテーションにもその挙動が[記載されています](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_lock-tables)．

> `LOCK TABLES`
>
> Enables use of explicit `LOCK TABLES` statements to lock tables for which you have the `SELECT` privilege. This includes use of write locks, **which prevents other sessions from reading the locked table**.
> [引用者強調]

つまり，巨大なテーブルのダンプを不用意に開始すると，アプリケーション全体が停止してしまう危険性があります．
まずいですよね．www

その上，`LOCK TABLES` はテーブル１つ１つに対して行われるので，`mysqldump` をそのまま使うと，テーブル同士のデータの一貫性を担保できません．

[`--single-transaction` フラグ](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html#option_mysqldump_single-transaction)で，ダンプ処理をトランザクションで囲むことにより，`LOCK
TABLES` が発生しなくなり，アプリケーションを停止させずにダンプすることができます．
また，トランザクションのおかげでテーブル同士のデータの一貫性も担保できます．
上記を踏まえ，これからは [`--single-transaction` フラグ](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html#option_mysqldump_single-transaction) を使って，下記のように運用データベースをダンプしましょう．

```sh
mysqldump --result-file=output.sql databasename --user=username --single-transaction
```
