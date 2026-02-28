#!/bin/bash
set -e

BASE_URL="${BASE_URL:-https://mudler.pm}"

binpath="${ROOT_DIR}/bin"
publicpath="${ROOT_DIR}/public"

if [ ! -e "${binpath}/hugo" ];
then
    [[ ! -d "${binpath}" ]] && mkdir -p "${binpath}"
    wget https://github.com/gohugoio/hugo/releases/download/v"${HUGO_VERSION}"/hugo_extended_"${HUGO_VERSION}"_"${HUGO_PLATFORM}".tar.gz -O "$binpath"/hugo.tar.gz
    tar -xvf "$binpath"/hugo.tar.gz -C "${binpath}"
    rm -rf "$binpath"/hugo.tar.gz
    chmod +x "$binpath"/hugo
fi

rm -rf "${publicpath}" || true
[[ ! -d "${publicpath}" ]] && mkdir -p "${publicpath}"

# Use project-local cache to avoid permission issues (e.g. in CI)
export HUGO_CACHEDIR="${ROOT_DIR}/.hugo_cache"

HUGO_ENV="production" "${binpath}/hugo" --gc -b "${BASE_URL}" -d "${publicpath}"

cp -rf CNAME $publicpath
