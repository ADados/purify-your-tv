# Contributing

Start with README.md and docs/ARCHITECTURE.md. Keep one topic per change and include clear reproduction steps, screenshots for UI work, and the exact model/Android/firmware you tested. Distinguish browser previews, injected remote events, physical-remote tests and restart tests.

Use the current package/component identities for updates. Changes to accessibility routing, network permissions, source URLs or recovery behavior require an explanation. Preserve the explicit Amazon Home escape, Fire TV system settings, other accessibility services and all installed apps.

Use JDK 17 / SDK 34 / build-tools 34.0.0. Build from source and follow tests/README.md. Theme changes must fit at 1920×1080 with remote focus visible. Exercise all themes and missing/offline/expired timetable states. For prayer logic, check local midnight, DST, Friday arrays and masjid switching during pending requests.

Never attach credentials, signing keys, APKs, raw device backups, private network addresses or screenshots showing account details. Device examples should contain only model, OS/firmware and verified observations. Security issues follow SECURITY.md. No project license has been selected; discuss licensing before redistribution.
