# ディレクトリの構成
[これ](https://github.com/golang-standards/project-layout/blob/master/README_ja.md)を参考にした. 

## cmd
エントリーポイントを置く.  
今回は`cmd/server.go`とした.  
実行する場合は
```sh
docker compose exec server go run cmd/server/main.go
```
もしくは
```sh
make run-server
```

## internal
`cmd`に置いたエントリーポイントで使うライブラリを置く.  
`pkg`もライブラリを置くディレクトリだが, 
`internal`は外部に公開しないライブラリ, `pkg`は公開するライブラリという違いがある.  
今回は公開しないのですべて`internal`下に置く. 

## docs
godocで生成されたものを含むドキュメントを置く. 
