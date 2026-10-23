#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
if [ -n "${JAVA_HOME:-}" ]; then export PATH="$JAVA_HOME/bin:$PATH"; fi
sdk=${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}
if [ -z "$sdk" ]; then echo "Set ANDROID_HOME to your Android SDK." >&2; exit 1; fi
tools=$sdk/build-tools/34.0.0
android=$sdk/platforms/android-34/android.jar
for command in java javac keytool python3 zip; do
    command -v "$command" >/dev/null || { echo "Missing tool: $command" >&2; exit 1; }
done
java_major=$(java -version 2>&1 | head -1 | sed -E 's/.*version "([0-9]+).*/\1/')
if [ "$java_major" != 17 ]; then echo "Use JDK 17 (set JAVA_HOME)." >&2; exit 1; fi
for required in "$tools/aapt2" "$tools/zipalign" "$tools/apksigner" "$tools/lib/d8.jar" "$android"; do
    [ -f "$required" ] || { echo "Missing SDK component: $required" >&2; exit 1; }
done
./prepare-signing.sh
export PURIFY_STORE_PASSWORD=${PURIFY_STORE_PASSWORD:-android}
export PURIFY_KEY_PASSWORD=${PURIFY_KEY_PASSWORD:-$PURIFY_STORE_PASSWORD}
keystore=${PURIFY_KEYSTORE:-$PWD/signing/local.jks}
alias_name=${PURIFY_KEY_ALIAS:-simplehome}
version_code=$(awk '/^[[:space:]]*versionCode / {print $2; exit}' app/build.gradle)
version_name=$(awk -F "'" '/^[[:space:]]*versionName / {print $2; exit}' app/build.gradle)
[[ "$version_code" =~ ^[0-9]+$ && "$version_name" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Invalid version in app/build.gradle" >&2; exit 1; }
output=build/local
mkdir -p "$output"
temporary=$(mktemp -d "$output/compile.XXXXXX")
trap 'rm -rf "$temporary"' EXIT
mkdir -p "$temporary/classes" "$temporary/dex"
python3 - "$temporary/AndroidManifest.xml" <<'PY'
import sys
import xml.etree.ElementTree as ET
ET.register_namespace('android', 'http://schemas.android.com/apk/res/android')
manifest = ET.parse('app/src/main/AndroidManifest.xml')
manifest.getroot().set('package', 'local.simplehome.firetv')
manifest.write(sys.argv[1], encoding='utf-8', xml_declaration=True)
PY
"$tools/aapt2" compile --dir app/src/main/res -o "$temporary/resources.zip"
"$tools/aapt2" link -I "$android" --manifest "$temporary/AndroidManifest.xml" --min-sdk-version 26 --target-sdk-version 34 --version-code "$version_code" --version-name "$version_name" -A app/src/main/assets -o "$temporary/resources.apk" "$temporary/resources.zip"
javac --release 8 -classpath "$android" -d "$temporary/classes" app/src/main/java/local/simplehome/firetv/*.java
java -cp "$tools/lib/d8.jar" com.android.tools.r8.D8 --release --lib "$android" --min-api 26 --output "$temporary/dex" "$temporary"/classes/local/simplehome/firetv/*.class
cp "$temporary/resources.apk" "$temporary/unsigned.apk"
zip -q -j "$temporary/unsigned.apk" "$temporary/dex/classes.dex"
"$tools/zipalign" -f 4 "$temporary/unsigned.apk" "$temporary/aligned.apk"
apk=$output/PurifyYourTV-FireTV.apk
"$tools/apksigner" sign --ks "$keystore" --ks-key-alias "$alias_name" --ks-pass env:PURIFY_STORE_PASSWORD --key-pass env:PURIFY_KEY_PASSWORD --out "$apk" "$temporary/aligned.apk"
"$tools/apksigner" verify "$apk"
echo "Built and signature verified: $apk (v$version_name)"
