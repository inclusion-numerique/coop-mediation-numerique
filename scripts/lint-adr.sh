#!/usr/bin/env bash
set -euo pipefail

version=0.16.2
empreinte=c7c4422db2f5c2177309c520bb4a55835ff4d9bc15c1485198b3e1dacc3e2faa
archive=mdbook-lint-x86_64-unknown-linux-gnu
cache=node_modules/.cache/mdbook-lint/$version
binaire=$cache/$archive/mdbook-lint

if [ ! -x "$binaire" ]; then
  mkdir -p "$cache"
  curl --fail --silent --show-error --location \
    --output "$cache/$archive.tar.xz" \
    "https://github.com/joshrotenberg/mdbook-lint/releases/download/v$version/$archive.tar.xz"
  echo "$empreinte  $cache/$archive.tar.xz" | sha256sum --check --quiet -
  tar --extract --xz --file "$cache/$archive.tar.xz" --directory "$cache"
fi

"$binaire" lint --quiet --config docs/decisions/.mdbook-lint.toml "$@" docs/decisions/[0-9]*.md
