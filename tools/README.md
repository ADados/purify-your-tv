# Tools

Python 3 standard library only; install Android platform-tools and put `adb` on PATH, or set ANDROID_HOME. Always specify a single authorized device with `--device`. No device is auto-discovered or silently selected.

```sh
python3 tools/tv.py --device <TV_IP>:5555 connect
python3 tools/tv.py --device <TV_IP>:5555 doctor
python3 tools/tv.py --device <TV_IP>:5555 backup
python3 tools/tv.py --device <TV_IP>:5555 install
python3 tools/tv.py --device <TV_IP>:5555 launch
python3 tools/tv.py --device <TV_IP>:5555 screenshot shots/dashboard.png
python3 tools/tv.py --device <TV_IP>:5555 helper-on
python3 tools/tv.py --device <TV_IP>:5555 helper-off
```

Replace `<TV_IP>`; do not include angle brackets literally. Installation and helper changes require a confirmation. For an action already approved by the owner, `--yes` can appear before the subcommand. It is not permission to operate someone else's TV.

Backups live under ignored `backup/`, including the previous app APK when present. They are not app-data backups. The tool never uninstalls, clears data, disables packages or changes the HOME role. Helper controls preserve other accessibility entries. `doctor` is read-only; `launch` intentionally opens the app; `screenshot` saves the current screen, so inspect it before sharing.

`restore.sh <TV_IP>:5555` wraps helper-off. See [Setup](../docs/SETUP.md) and [Restore](../docs/RESTORE.md). ADB is for setup only; close debugging afterward.
