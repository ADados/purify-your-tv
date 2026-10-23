# Change history

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
- Preserved MCWS as the default direct source and system settings access.

## 1.1.0

- Added opt-in accessibility routing from the known Amazon Home activity to the dashboard.
- Added settings transition guard, intentional Amazon Home bypass, turn-off control and boot/unlock probe.
- Physical Home and restart behavior were confirmed by the owner on the recorded Fire TV firmware.

## 1.0.0

- Initial English prayer dashboard, direct MCWS timetable, Hijri estimate, app shortcuts and app library.
- Packaged-only WebView with fixed-host native HTTPS requests.
