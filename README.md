# Purify Your TV

**A quieter Fire TV home screen, built around your apps and your masjid.**

![Purify Your TV in Obsidian and Gold](docs/screenshots/obsidian.png)

Five themes. Clear prayer and Iqamah times. A remote-friendly app library. No sponsored rows in this dashboard. No root and no disabling Amazon's launcher.

This repository contains the complete source for **v1.3.1 (unreleased)**. The launcher uses internet access for mosque timetables. It does not include debloating lists or automatically remove any apps.

> **Tested device:** Fire TV Stick 4K Max, 2nd generation (AFTKRT), Android 11 / Fire OS 8.1.8.5. Other Fire OS versions, Android TV and Google TV need separate testing. Samsung Tizen and LG webOS cannot install this Android app.

## Disclaimer — use at your own risk

**You install and use this project entirely at your own risk.** Installing a custom launcher, enabling debugging, or changing device settings can cause instability, loss of functionality, data loss, or leave your TV/Fire TV device unusable. Compatibility and recovery are not guaranteed.

These changes **may affect your warranty or eligibility for manufacturer support**, depending on your device, the changes made, the manufacturer's terms and applicable law. Check those terms before proceeding.

This project is provided **“as is,” without warranties of any kind**. To the extent permitted by applicable law, the author and contributors accept no responsibility or liability for device damage, system failures, lost data, repair costs, or warranty/support issues arising from its use. Back up first, read the setup and recovery instructions, and proceed only if you understand and accept the risks.

## What you get

| Feature | Details |
| --- | --- |
| Prayer dashboard | Begins and Iqamah clearly separated; Sunrise has no Iqamah. |
| Next Iqamah | Countdown, highlighted prayer and Friday Jumuah sessions. Published tomorrow times are used when available. |
| Choose your masjid | Search Royyaa by name/city or look up a Masjidal ID. The clock and prayer times follow that masjid's timezone. |
| Five saved themes | Teal & Gold, Midnight & Mint, Sand & Olive, Obsidian & Gold, Twilight. |
| English / العربية | Choose your language in Settings. Arabic uses a right-to-left interface; the choice is saved. |
| Your apps | Six shortcuts plus the full launchable-app library. The installed apps remain untouched. |
| Home-button helper | Optional Fire OS accessibility workaround; Amazon stays the system Home handler. A short Amazon flash can occur. |
| Back stays home | Back closes settings/library, then stays on the dashboard. Use the explicit **Amazon Home** button to leave. |

![Launcher settings with theme and masjid choices](docs/screenshots/settings.png)

Screenshots are **browser-rendered demonstrations with example times and a fictional masjid**, not evidence of live prayer times or stock Amazon screens. See the [gallery](docs/SCREENSHOTS.md) and [tested-device record](examples/fire-tv-stick-4k-max-2nd-gen/README.md).

## Quick start

1. Read [SETUP](docs/SETUP.md), including the Fire TV debugging instructions and safety notes.
2. Install **JDK 17**, Android SDK **platform 34**, **build-tools 34.0.0**, **platform-tools**, and Python 3. Use the same trusted Wi-Fi/LAN as the TV.
3. Build with your own local signing key:

   ```sh
   cd launcher
   export ANDROID_HOME="/path/to/Android/sdk"
   export JAVA_HOME="/path/to/jdk-17"
   ./build-local.sh
   cd ..
   ```

4. Connect, accept the debugging prompt on the TV, then install:

   ```sh
   python3 tools/tv.py --device <TV_IP>:5555 connect
   python3 tools/tv.py --device <TV_IP>:5555 doctor
   python3 tools/tv.py --device <TV_IP>:5555 install
   python3 tools/tv.py --device <TV_IP>:5555 launch
   ```

   Replace `<TV_IP>`; do not paste the angle brackets into a shell. Backups are saved locally before installation. Windows users can use `python` instead of `python3` and follow the [Gradle build instructions](docs/BUILD.md).

5. In the launcher, choose your masjid in **Settings**, then select a language and theme. Initial defaults are **English** and **Teal & Gold**, with **no masjid preselected**. Settings opens automatically until you choose a masjid. The clock uses device time until then; prayer times remain unavailable.
6. If desired, follow [HOME BUTTON](docs/HOME_BUTTON.md) to enable the optional helper. Installation alone does **not** enable it or change the system Home role.
7. Test the **physical remote**, then disable network/USB debugging and revoke authorizations. The installed app and helper do not need a computer or ADB to run.

## Set up with a coding agent

Paste this into Claude Code, ChatGPT/Codex, or another coding agent with terminal access:

```text
Help me set up Purify Your TV from https://github.com/ADados/purify-your-tv on my own TV. Read the repository's README.md and PROMPT.md first. Ask for my TV model and connection details, verify compatibility, and guide me through enabling and authorizing debugging. Back up before changes, build from source, and ask before installing or enabling the optional Home-button helper. Help me choose a theme and masjid, test the physical remote and restart, and close debugging afterward. Preserve existing apps, settings and other accessibility services. Never root, uninstall apps, disable Amazon Home, clear app data or bypass device protections. Stop and explain if my device is unsupported.
```

The agent needs repository access and tools to build and connect to your TV. A chat-only assistant can explain the steps but cannot install the app itself. See [PROMPT.md](PROMPT.md) for the full safe procedure.

## Masjid search and prayer times

- **Name/city search only finds masjids already added to Royyaa.** No matches is not a broken search. Use the masjid's Masjidal ID to add it, then select the named result.
- The keyboard button reads **Search**, not Next. It submits the field, closes the keyboard and shows results.
- `z0AWYBKj` identifies **Scarborough Islamic Centre, England**. It is an example and is not selected automatically.
- Times follow the selected masjid's timezone. Multiple Friday sessions are preserved.
- Missing Iqamah remains unavailable. No timetable is invented, and stale days or another masjid's cache are not substituted.
- **Clear selection** removes your masjid choice without deleting language/theme preferences. Previously saved Royyaa choices remain available after upgrades; unsupported older selections require choosing a masjid again.
- Schedules say **Prayer times provided by Royyaa** beneath the timetable. Hijri dates are estimates.

Prayer timetables and masjid search are provided by [royyaa.com](https://royyaa.com). See [Prayer times](docs/PRAYER_TIMES.md) for help choosing your masjid.

## To-do

Planned features—not available yet:

- [ ] Calculate prayer-begins times for locations or masjids not available on [royyaa.com](https://royyaa.com).
- [ ] Allow choosing a city or coordinates, timezone, calculation method and Asr convention for calculated times, including daylight-saving handling.
- [ ] Clearly label calculated times separately from masjid-published timetables. Keep Iqamah and Jumuah schedules mosque-provided or manually entered; do not calculate or guess them.

## Repository map

Source code, setup tools, documentation, themes and tested-device examples are organized separately.

| Path | Purpose |
| --- | --- |
| [`launcher/`](launcher/) | Android app, packaged HTML/CSS/JavaScript, Gradle wrapper, SDK-only builder. |
| [`tools/`](tools/README.md) | Connect, diagnose, back up, install, launch, screenshot and opt-in helper controls. |
| [`docs/`](docs/README.md) | Setup, build, remote behavior, prayer times, troubleshooting, architecture and screenshots. |
| [`themes/`](themes/README.md) | Theme gallery and where each bundled stylesheet lives. |
| [`examples/`](examples/README.md) | Tested-device record; not a debloating list. |
| [`addons/`](addons/README.md) | Optional Home helper documentation; no third-party APKs bundled. |
| [`tests/`](tests/README.md) | Reproduction and manual regression checklist. |
| [`PROMPT.md`](PROMPT.md) | Safe step-by-step instructions for a coding assistant. |

## Safety and recovery

No root, firmware flashing, APK-verification bypasses, package uninstalling or automatic debloating. Amazon's launcher remains enabled. The helper sees only Amazon launcher window changes; it cannot read screen content and does not intercept remote keys.

To return to Amazon normally, use **Amazon Home**, turn off **Home helper**, or follow [RESTORE](docs/RESTORE.md). Do not clear app data or uninstall to fix a signing mismatch: restore your original signing key or install a matching update. Never publish local keys, backups, screenshots containing account details or device identifiers.

## Documentation and contributions

- [Build from source](docs/BUILD.md) · [Troubleshooting](docs/TROUBLESHOOTING.md) · [Architecture](docs/ARCHITECTURE.md)
- [Change history](CHANGELOG.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)
- [Project origins and third-party notices](THIRD_PARTY_NOTICES.md)

No project-wide license has been chosen yet. The repository's visibility does not grant a redistribution license; third-party components retain their own terms.
