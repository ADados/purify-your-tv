# Change history

## 1.3.1 (unreleased)

- Removed the built-in direct prayer source and hard-coded masjid/location defaults.
- New or unsupported older selections open Settings for the user to choose a masjid. Saved Royyaa selections, language and theme preferences remain intact.
- Added Clear selection, a localized no-masjid state, and device-local clock behavior before selection. No timetable is fetched or displayed without a chosen masjid.

## 1.3.0 (unreleased)

- Added Settings → Language with English and العربية, saved independently of themes and masjid choices.
- Added Arabic dashboard/settings/prayer labels, statuses, placeholders, theme names, countdowns and app-owned helper messages.
- Added RTL layout with isolated left-to-right time/ID fields and physical-direction remote navigation.
- Arabic date formatting remains Gregorian; prayer calculations/timezones and native Hijri estimation are unchanged.
- Added privacy-safe Arabic dashboard/settings demo screenshots. Verified SDK build/signature and 193 temporary browser checks, including all five RTL themes, reload persistence, Arabic query forwarding, English restoration, physical-direction RTL navigation and existing Back/keyboard checks. No on-TV or physical-remote test was performed for this branch.

## 1.2.3

- Back closes launcher settings or the app library, then stays on the dashboard on repeated presses.
- Removed native Back's fallback to Amazon, including during WebView loading.
- Kept the explicit Amazon Home button as the intentional exit.
- Verified eight injected Back events from each overlay on the tested Fire TV; 106 local browser checks passed during development.

## 1.2.2

- Fire TV keyboard advertises Search instead of Next; Search/Next/Done/Go submit the focused masjid field.
- Submission dismisses the keyboard and moves focus to the search control/results.
- Empty results clearly explain Royyaa's existing-record search scope.
- Verified actual on-screen keyboard submission and live city/name results on the tested TV.

## 1.2.1

- Renamed Simple Home to Purify Your TV throughout user-facing labels and helper descriptions.
- Preserved package/component IDs and stored preferences for in-place upgrades.

## 1.2.0

- Added five saved themes and launcher settings.
- Added Royyaa name/city search, exact Masjidal ID lookup and explicit result selection.
- Added seven-day schedules, masjid-local timezone handling, multiple Jumuah sessions and separate per-masjid caches.
- Added attribution under prayer times, missing-data handling and stale-response isolation.
- Preserved system settings access.

## 1.1.0

- Added opt-in accessibility routing from the known Amazon Home activity to the dashboard.
- Added settings transition guard, intentional Amazon Home bypass, turn-off control and boot/unlock probe.
- Physical Home and restart behavior were confirmed by the owner on the recorded Fire TV firmware.

## 1.0.0

- Initial English prayer dashboard, Hijri estimate, app shortcuts and app library.
- Packaged-only WebView with fixed-host native HTTPS requests.
