# Security and privacy

For a sensitive issue, contact the repository owner privately through an already-established trusted channel. Do not open a public issue with a working exploit, credentials, signing material or a raw TV backup. This repository does not promise a private GitHub advisory channel is enabled.

The Android app has INTERNET permission to retrieve prayer times from [royyaa.com](https://royyaa.com). It contains no analytics. The WebView cannot load remote pages or make network requests; remote text is never executed or inserted as HTML. Search terms and masjid IDs are sent to Royyaa when requested. Timetables are fetched only after a masjid is selected. Normal local preferences and caches are not encrypted; Android app storage isolates them.

The optional accessibility service sees Amazon launcher window-state events only; it has no screen-content or key-filtering capability. Firmware changes can break its known activity match. Amazon stays enabled and remains the system Home handler.

ADB over port 5555 is a sensitive, typically plaintext administrative connection. Use it only on a trusted LAN, authorize only your own computer, never expose it to the internet, then disable debugging and revoke authorizations. No PC agent is needed after setup.

Local development signing uses a conventional `android` password for a locally generated development key. This is not suitable protection for a production signing key. Use environment-configured credentials and secure key storage for distribution. Never upload signing files. Keep the original key for existing app updates.
