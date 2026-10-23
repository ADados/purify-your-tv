# Setup

## Before you begin

This procedure was exercised on a Fire TV Stick 4K Max 2nd generation, Fire OS 8.1.8.5 / Android 11. It is not a Samsung Tizen procedure. Android TV/Google TV can run Android APKs in principle, but this project's Home helper is specifically for Amazon's launcher and has not been validated on those systems.

Use your own TV and computer on a trusted network. Do not open router ports. Installation does not remove apps, change HDMI, or replace firmware. Keep a working remote and access to Amazon Settings.

## 1. Enable Fire TV development access

Menu wording varies by firmware. On the tested generation:

1. Open **Settings → My Fire TV → About** (some TVs say **Device & Software**).
2. If Developer Options is hidden, select the device/model entry in About seven times.
3. Go back to **Developer Options** and enable **ADB Debugging**.
4. Find the TV's current LAN IP in its network/about page.
5. Run `python3 tools/tv.py --device <TV_IP>:5555 connect` from this repository.
6. On the TV, allow debugging for **your** computer. Never bypass authorization. If there is no prompt, check the network and toggle ADB debugging once.

Do not enter localhost/127.0.0.1 or follow the Samsung Host PC IP steps: they belong to a different OS and app.

For another Android device, use that manufacturer's official Developer Options and wireless debugging procedure. Devices requiring pairing ports instead of ADB 5555 need their own supported pairing flow; do not assume this Fire OS guide applies.

## 2. Inspect, back up, build

```sh
python3 tools/tv.py --device <TV_IP>:5555 doctor
python3 tools/tv.py --device <TV_IP>:5555 backup
```

The tool checks the selected device, records model/firmware, packages and existing accessibility settings, and backs up the current launcher APK if installed. It does not back up private app data; keep the original signing key and use in-place updates. Backups are local and ignored by Git.

Follow [BUILD](BUILD.md). Then install the source-built APK:

```sh
python3 tools/tv.py --device <TV_IP>:5555 install
python3 tools/tv.py --device <TV_IP>:5555 launch
```

The installer asks for confirmation and takes another backup before installing. It never uninstalls or clears app data. A signature mismatch is a stop condition, not permission to remove the existing app.

## 3. Configure the launcher

- **Settings → Language → العربية:** switches the dashboard, settings, prayer labels and app-owned helper messages to Arabic with right-to-left layout. Select **English** to switch back. No restart is needed; the choice survives updates/restarts without changing the masjid or theme.
- **الإعدادات ← اللغة ← العربية:** لتفعيل الواجهة العربية. يمكنك العودة إلى English في أي وقت.
- Clock digits, timetable numbers, IDs and timezone identifiers remain Latin for readability. Masjid/app names are not translated. Android/Fire TV system screens and available keyboard languages follow the device's own settings; this switch does not install an Arabic keyboard.
- **Settings → Appearance:** choose a theme; it saves immediately.
- **Your masjid:** search by name/city or use a Masjidal ID, then select **Use [masjid name]** after checking address and timezone.
- **Use MCWS · Canton:** returns to the original MCWS source. MCWS is the initial default, not a geolocation choice.
- The on-screen keyboard's **Search** action submits and closes the keyboard. Search names/cities only covers existing Royyaa entries. Add an unlisted masjid by ID.
- **Fire TV settings:** opens device settings without the Home helper pulling you back.
- **Amazon Home:** intentional exit; the helper allows Amazon for ten minutes. Reopen Purify Your TV to resume.
- **Back:** closes keyboard/overlays as appropriate and remains on your dashboard after repeated presses.

## 4. Optional Home-button integration

Follow [HOME BUTTON](HOME_BUTTON.md). Installation does not grant accessibility. Do not disable Amazon's launcher or force a third-party Home role on Fire OS.

## 5. Verify and close debugging

Try physical arrows, OK, repeated Back, YouTube, Settings and Amazon Home. If enabling the helper, ask a person to test physical Home from YouTube and after a full restart. ADB injection is not a substitute for that test.

Turn off **ADB Debugging**, any Network/USB debugging toggle, and revoke authorizations in Developer Options where offered. Reboot if needed, then use `adb connect <TV_IP>:5555` to confirm it no longer connects. Do not mistake an old cached `adb devices` entry for live access. The app and helper run entirely on the TV without an awake computer.
