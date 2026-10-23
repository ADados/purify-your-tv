# Regression checklist

This repository currently provides a **manual reproduction checklist**, not a committed automated test suite. Development used a temporary browser harness and Node checks; those results are historical observations, not a reusable CI badge. No build/test workflow has been silently added.

## Before operating a TV

1. Build from source with JDK 17 / SDK 34 / build-tools 34.0.0. Verify the APK signature with `apksigner verify`.
2. Run `./gradlew --no-daemon lintRelease assembleRelease` when Gradle dependencies are available. Report lint separately from the SDK build.
3. Check that Git contains no signing files, APKs, SDK caches, local.properties, backups, personal screen captures or device identifiers.
4. Run Python and shell syntax checks for the tools; use `tv.py --help` and inspect planned commands before device use.

## Prayer data

- Fresh, cleared and unsupported older selections show no masjid, no prayer times and no timetable request; Settings opens for setup. Existing Royyaa selections and their valid caches survive upgrades.
- Royyaa search empty results, unknown ID, malformed response, missing Iqamah and invalid timezone/date/time handled visibly.
- `zuhr` maps to Dhuhr, all Jumuah array entries survive and replace regular Friday Dhuhr Iqamah candidates.
- `00:00` and `12:00` display as midnight/noon correctly; local time is never mistaken for UTC.
- Check Europe/London's 2026-10-25 DST change and the selected masjid's local date boundary.
- After Isha, published tomorrow Fajr may appear; missing/expired future data is never invented.
- Switch masjids while requests are pending; old replies must not overwrite the new source. Cached data must match both masjid ID and timezone.

## Interface

- Language: English is the default; select العربية, verify RTL and translated labels/statuses, reload, then return to English and verify LTR. Neither switch may change the selected masjid, timezone, cached times, theme or Home-helper state.
- Check all five themes in Arabic, both Friday sessions, Gregorian date year, Latin time/ID isolation, visible remote focus, unchanged Arabic query forwarding and translated empty/error responses. System keyboard languages are separate device settings.
- All five themes: no clipped text at 1920×1080, visible focus and separate begins/Iqamah labels.
- Theme and masjid survive an app restart/update without clearing data.
- Name/city and ID keyboard Search dismiss the keyboard and return focus to visible controls/results.
- Empty city/name results explain the directory limitation rather than pretending to search all masjids worldwide.
- Back from keyboard/settings/library, then at least eight more Back presses: dashboard stays open.
- Explicit Amazon Home remains available. Fire TV settings stay open.
- Prayer attribution is correct for the selected source, and Hijri remains labeled an estimate.

## Physical remote and restart

On the exact target firmware, test arrows from each screen edge, OK, YouTube launching, physical Home with helper off/on, Settings and Amazon Home escape. Restart fully, do not manually open the app, then verify physical Home again. Do not call an injected Home event proof of real remote/reboot behavior.

Close ADB/debugging and confirm access is no longer available after setup. Log only the model/OS/firmware, app version, tests actually performed and non-sensitive screenshots.
