# Fire TV Stick 4K Max, 2nd generation

- Model: **AFTKRT**, codename **karat**.
- Android: **11**, API **30**.
- Fire OS: **8.1.8.5**, build **RS8185/3891**.
- App screenshot size: **1920×1080**, reported density **320**.
- Last developed app version: **1.2.3**.

## Verified observations

The dashboard installed and launched, displayed a live prayer timetable, opened streaming apps and system settings, and rendered launcher settings and all theme choices. Live Royyaa ID lookup returned Scarborough Islamic Centre; its name/city lookup was also exercised using the actual Fire TV keyboard's Search button. The lookup test did not change the owner's masjid selection. London timezone/DST, Friday sessions, tomorrow and invalid/expired data were checked locally against public API responses; do not represent all of these as on-TV timezone-switch tests.

The owner confirmed physical remote arrows/app launching and the Home redirect, including after a full restart, during earlier helper development. The helper remained enabled/bound through later in-place updates. A full physical-remote restart test was **not repeated for every UI-only update**.

Version 1.2.2 replaced the Fire TV keyboard's ineffective Next action with Search, which submitted and closed the keyboard on-device. Version 1.2.3 stayed on the dashboard after eight injected Back events from settings, then eight from the app library. Those Back checks are injected-event tests, not a new physical-Home proof.

Amazon remains enabled and the system Home handler. The exact Home activity matched was `com.amazon.tv.launcher.ui.HomeActivity_vNext`. The optional accessibility service reported zero content/key-filter capabilities. System settings and the explicit Amazon Home bypass were verified during helper development.

## Limits

No rooting, stock-launcher disabling, factory reset or app debloating was used. Different firmware can rename the Home activity or change accessibility behavior. No claims are made for older Fire OS, Android/Google TV or Samsung Tizen from this record.

Follow [SETUP](../../docs/SETUP.md), [HOME BUTTON](../../docs/HOME_BUTTON.md) and [RESTORE](../../docs/RESTORE.md). Keep local device backups and the original signing key private.
