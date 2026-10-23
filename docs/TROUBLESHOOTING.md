# Troubleshooting

| Problem | Check / safe action |
| --- | --- |
| ADB unauthorized | Accept your computer on the TV. If needed revoke stale debugging authorizations and reconnect. No bypass. |
| ADB offline/refused | Correct TV IP, same trusted LAN, ADB Debugging enabled, no guest-network client isolation. Some newer platforms use pairing instead of 5555. |
| SDK build says Java 8 / `--release` invalid | Set JAVA_HOME to JDK 17; check `java -version` and `javac -version`. |
| Missing SDK files | Install platform 34 and build-tools 34.0.0; set ANDROID_HOME. |
| Gradle hangs | Use the SDK-only builder. Do not kill unrelated Java processes. A fallback build is not a lint pass. |
| Signing mismatch | Restore the original private signing key. Do not uninstall or clear data. |
| City/name has no results | Royyaa only searches previously added masjids. Check spelling or add the masjid with its Masjidal ID. |
| Keyboard Next does nothing | Use v1.2.2 or later; it now advertises Search, submits and dismisses the keyboard. Back can dismiss the keyboard before using the separate Search button. |
| Wrong country/timezone | Confirm returned masjid name/address before selecting. `z0AWYBKj` is Scarborough, England. Clear the selection and choose your own masjid if needed. |
| Times unavailable/offline | Check internet and the masjid's published timetable. Missing/stale Iqamah is not guessed; only valid cached dates are used. |
| Home still shows Amazon | Check helper enabled/bound, whether the explicit Amazon Home bypass is active, and model/firmware. Reopen the app to clear bypass. Never disable Amazon Home. |
| Home briefly flashes Amazon | Expected for this window-event workaround; it is not the system Home role. |
| Repeated Back exits | Use v1.2.3 or later. Back stays inside the dashboard; only the explicit Amazon Home button leaves. |
| Helper fails after restart | Test full restart, wait for user unlock, do not manually open the app before testing startup, then press physical Home. Report exact firmware and observed behavior without raw personal logs. |
| Amazon Settings won't stay open | Turn off the helper and report the exact Settings activity/model. Do not modify unrelated services. |

Run `python3 tools/tv.py --device <TV_IP>:5555 doctor` for read-only status. Screenshot only the app's own screen with `screenshot shots/issue.png`; inspect it for private details before sharing. Streaming/DRM screenshots may be blank without indicating damage.
