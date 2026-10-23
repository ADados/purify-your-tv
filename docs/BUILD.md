# Build from source

## Requirements

- JDK **17** (not Java 8).
- Android SDK **platform 34**, **build-tools 34.0.0**, **platform-tools**.
- Python 3 and `zip` for the SDK-only builder.
- Gradle wrapper **8.9**, Android Gradle Plugin **8.5.2** for the Gradle option.

Set `JAVA_HOME` and `ANDROID_HOME` for your machine. Paths in these docs are placeholders, not files you should create literally. Install SDK components and accept their licenses using Android Studio's SDK Manager or the official SDK command-line tools.

## Signing and upgrades

The first local build generates `launcher/signing/local.jks`, alias `simplehome`, with a conventional local-development password `android`. This file is ignored by Git and is never supplied by this repository. Store it safely: the same package can only be updated in place with the same signing identity.

**Existing installations from the original owner's build need that owner's original key.** A newly generated key will not update them. Stop at `INSTALL_FAILED_UPDATE_INCOMPATIBLE`; do not uninstall or clear data as a workaround.

For a private/distribution key, set `PURIFY_KEYSTORE` to its absolute path, `PURIFY_KEY_ALIAS`, `PURIFY_STORE_PASSWORD` and `PURIFY_KEY_PASSWORD` in your local environment. Do not put passwords into command history, committed config or issues. If an explicitly configured key is missing, the builder refuses to replace it. The Gradle and SDK builders honor these same environment variables.

## SDK-only build (macOS / Linux)

```sh
cd launcher
export JAVA_HOME="/path/to/jdk-17"
export ANDROID_HOME="/path/to/Android/sdk"
./build-local.sh
```

Output: `launcher/build/local/PurifyYourTV-FireTV.apk` from the repository root. The builder compiles resources and Java, dexes with D8, zip-aligns, signs and verifies. Version values are read from `app/build.gradle`. Temporary compilation files are removed after the build.

This path was validated for the publication copy. It is the recommended fallback if Gradle dependency resolution or its daemon is unavailable.

## Gradle build

On macOS/Linux:

```sh
cd launcher
./prepare-signing.sh
./gradlew --no-daemon lintRelease assembleRelease
```

On Windows with PowerShell, create a development key first (or supply your existing key with the environment variables above):

```powershell
cd launcher
New-Item -ItemType Directory -Force signing
keytool -genkeypair -keystore signing/local.jks -alias simplehome -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Purify Your TV Local Development" -noprompt
gradle --no-daemon lintRelease assembleRelease
```

The Windows example requires a separately installed **Gradle 8.9** because a Windows wrapper script is not bundled. Do not regenerate or replace an existing key. Windows builds were not verified on the recorded Fire TV development machine.

Gradle output: `launcher/app/build/outputs/apk/release/app-release.apk`. Pass that path explicitly to the installer:

```sh
python3 tools/tv.py --device <TV_IP>:5555 install --apk launcher/app/build/outputs/apk/release/app-release.apk
```

## Validation

See [tests/README.md](../tests/README.md). A successful SDK build verifies compilation and signature, **not** Gradle lint. Run the Gradle lint command separately when dependencies are available. Do not claim a lint pass if it was not completed.

Never commit generated APKs, signing files, SDKs, Gradle caches or absolute-path `local.properties`. This repository does not publish a prebuilt release or silently choose a distribution signing key.
