# Architecture and change map

## Android host

`launcher/app/src/main/java/local/simplehome/firetv/MainActivity.java` owns a fullscreen WebView and a narrow `TV` JavaScript bridge. The package remains `local.simplehome.firetv` for installed-app continuity; the display name is Purify Your TV.

The bridge discovers installed launchable components, supplies locally rendered icons, launches only its discovered allowlist, opens system/helper settings and performs fixed-host HTTPS requests. It also provides a native HijrahDate estimate using the selected timezone. Fire OS's JavaScript Islamic-calendar formatting was avoided after an incorrect on-device result during development.

The WebView loads packaged assets only. File/content cross-access, remote navigation and WebView network loads are blocked. CSP allows local scripts/styles and local/data icons. Remote content is treated as data, never rendered as HTML or executed. Masjid search and selectable timetables come from [royyaa.com](https://royyaa.com).

An InputConnectionWrapper advertises Search for the two settings inputs and submits Search/Next/Done/Go to the focused launcher field. JavaScript moves focus and asks the native bridge to dismiss the keyboard. Native Back never falls through to Amazon while assets load.

## Packaged dashboard

| File in `launcher/app/src/main/assets/` | Role |
| --- | --- |
| `index.html` | Dashboard, app library and launcher settings markup. |
| `home.js` | Remote navigation, app dock, rendering, source changes, cache isolation and refresh lifecycle. |
| `prayer-data.js` | Timetable parser, time validation, local dates, zone/DST epoch conversion and next-prayer selection. |
| `launcher-settings.js` | Five themes, persistent choices, masjid search/selection and correlated native requests. |
| `i18n.js`, `language.css` | Saved English/Arabic choice, local translations, Gregorian Arabic date formatting, RTL layout and isolated left-to-right time/ID fields. |
| `home.css`, `refresh.css` | Original teal layout and larger per-prayer cards. |
| `modern.css`, `theme-*.css` | Modern base and palette/layout variants. |
| `settings.css` | Common settings, focus and timetable-attribution layout. |
| `islamic-night.svg`, `modern-arches.svg`, `dusk.svg` | Local code-native backgrounds. |

LocalStorage keeps stable theme/masjid preference keys and the independent `simplehome.language.v1` language choice. Language changes re-render existing data without switching the masjid, changing its timezone or triggering a timetable request. The native bridge receives the validated language for app-owned dialogs, keyboard action labels and Hijri month names; system settings and installed-app names remain device-provided. Timetable caches are keyed by masjid ID and include timezone. No masjid is preselected; until the user chooses one, the clock follows the device timezone and no timetable request is made. Masjid switches increment a generation so late requests cannot repopulate another masjid's screen. External strings use textContent, not HTML. Arabic dates explicitly use the Gregorian calendar, leaving prayer calculations and the native Hijri estimate separate.

## Home helper

`HomeReturnService.java` and `HomeProbeActivity.java` implement the optional Amazon-window routing, user-unlock handling and one-per-boot transparent probe. The service configuration requests no content retrieval or key filtering. Amazon stays enabled; other Amazon window classes cancel pending redirects. Opening system settings guards the transition. Explicit Amazon Home pauses routing for ten minutes. The app does not auto-enable accessibility.

## Scope

No PC daemon, scheduled Mac job, Tizen root installer, Samsung certificates, debloating list, app uninstaller or firmware modification belongs to this Android project. Android TV/Google TV default-Home integration is not implemented by the supplied Fire OS helper. Build and guide changes are separate from user-device state; copying this repository never implies permission to operate a TV.
