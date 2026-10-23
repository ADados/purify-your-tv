#!/bin/sh
set -eu
cd "$(dirname "$0")"
if [ -n "${JAVA_HOME:-}" ]; then export PATH="$JAVA_HOME/bin:$PATH"; fi
keystore=${PURIFY_KEYSTORE:-$PWD/signing/local.jks}
export PURIFY_STORE_PASSWORD=${PURIFY_STORE_PASSWORD:-android}
export PURIFY_KEY_PASSWORD=${PURIFY_KEY_PASSWORD:-$PURIFY_STORE_PASSWORD}
alias_name=${PURIFY_KEY_ALIAS:-simplehome}
if [ -f "$keystore" ]; then
    echo "Using the existing signing key; keep it for future updates."
    exit 0
fi
if [ -n "${PURIFY_KEYSTORE:-}" ]; then
    echo "PURIFY_KEYSTORE does not exist. Restore your intended key; refusing to replace it." >&2
    exit 1
fi
mkdir -p signing
umask 077
keytool -genkeypair -keystore "$keystore" -alias "$alias_name" \
    -storepass:env PURIFY_STORE_PASSWORD -keypass:env PURIFY_KEY_PASSWORD \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Purify Your TV Local Development" -noprompt
echo "Created a local development key in signing/. Do not publish it."
