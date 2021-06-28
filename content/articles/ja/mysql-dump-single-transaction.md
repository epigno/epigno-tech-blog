---
title: MySQLのダンプをトランザクションに囲む
description: MySQLのデータベースをより安全にダンプするための方法を紹介します．
img: /img/mysql.png
alt: MySQL
author:
  name: Malik Olivier Boussejra
  slug: olivier
  bio: CTO at Epigno
  img: /img/authors/pic-malik-olivier-boussejra.png
tags:
  - mysql
---

MySQLのDBをダンプするときに，`mysqldump` の [`--single-transaction` フラグ](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html#option_mysqldump_single-transaction) を使うことで、トランザクションで囲めることができます．
今回、ダンプをトランザクションで囲むメリットについて話そうと思います．


ダンプするには，[`mysqldump`](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) というユティリティはよく使われています．
一般的に，下記のように使います．

```sh
mysqldump --result-file=output.sql databasename --user=username
```

`mysqldump` は、デフォルトでテーブルをロックしているってご存知でしたか？
`mysqldump` のドキュメンテーションを確認しましょう．

> `mysqldump` requires at least the `SELECT` privilege for dumped tables,
> `SHOW VIEW` for dumped views, `TRIGGER` for dumped triggers,
> **`LOCK TABLES` if the `--single-transaction` option is not used**,
> and (as of MySQL 8.0.21) `PROCESS` if the `--no-tablespaces` option is not used.
> [引用者強調]

テーブルをロックすると，ダンプ中、他のSQLセッションはテーブルを読み取れません．無論、書き込みもできません。
ドキュメンテーションにもその挙動が[記載されています](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_lock-tables)．

> `LOCK TABLES`
>
> Enables use of explicit `LOCK TABLES` statements to lock tables for which you have the `SELECT` privilege. This includes use of write locks, **which prevents other sessions from reading the locked table**.
> [引用者強調]

これで，でかいデーブルをダンプすると、ほとんどアプリ全体が停止することになります．
まずいですよね．www

その上，`LOCK TABLES` はテーブル１つ１つに対して行われるので、`mysqldump` をそのまま使うと、テーブル同士のデータの一貫性を担保できません．

[`--single-transaction` フラグ](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html#option_mysqldump_single-transaction)で，トランザクションで囲むことで、`LOCK
TABLES` が発生せず，アプリが正常に動作しながらダンプができ、トランザクションのおかげでテーブル同士のデータの一貫性も担保できます．
なので，これから [`--single-transaction` フラグ](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html#option_mysqldump_single-transaction) を使って、下記のように運用データベースをダンプしましょう．

```sh
mysqldump --result-file=output.sql databasename --user=username --single-transaction
```
