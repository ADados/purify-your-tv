# Home and Back on Fire TV

## What this does—and does not do

Amazon remains installed, enabled and the system Home handler. An optional accessibility service watches `TYPE_WINDOW_STATE_CHANGED` events from `com.amazon.tv.launcher` only. It redirects the exact known `com.amazon.tv.launcher.ui.HomeActivity_vNext` window to Purify Your TV. A brief Amazon screen flash is expected on some transitions.

The service cannot read screen contents, does not filter remote keys and does not watch YouTube or other apps. It is a model/firmware-specific workaround, not a permanent system launcher replacement. Tested observations are listed in the [device example](../examples/fire-tv-stick-4k-max-2nd-gen/README.md).

## Enable only with the owner's approval

First install, launch, and verify the dashboard and Settings access. If Fire TV exposes the service in Accessibility settings, enable **Purify Your TV button helper** there. If not, the included tool can opt in over authorized ADB:

```sh
python3 tools/tv.py --device <TV_IP>:5555 helper-on
```

The tool asks for confirmation, saves the previous accessibility settings locally and adds only `local.simplehome.firetv/.HomeReturnService`, preserving all existing services. It does not disable the stock launcher or set the HOME role.

## Verify physically

1. Open YouTube, press the **physical Home** button and confirm the prayer dashboard.
2. Open Fire TV settings; it must remain usable.
3. Select **Amazon Home** in the dashboard; Amazon must remain usable for ten minutes.
4. Reopen Purify Your TV manually to resume routing immediately.
5. Hold Power until the device logo appears. Wait for startup without manually opening the app. Repeat physical Home from YouTube.

The TV-only startup path waits for user unlock and uses a one-time boot probe during the first three minutes. It does not require an awake Mac or a computer service. Firmware updates can break the known window class; stop rather than disabling system components to compensate.

## Back behavior

The keyboard handles Back to close itself. Launcher Back closes settings or the app library, then stays on the dashboard indefinitely. It no longer triggers Amazon or the ten-minute bypass. The explicit **Amazon Home** button is the intentional exit.

## Turn off / recover

Use **Home helper → Turn off** in the app, disable the service in Fire TV Accessibility, or run:

```sh
python3 tools/tv.py --device <TV_IP>:5555 helper-off
```

The tool removes only this helper and leaves other enabled services intact. The app does not automatically re-enable a service that the user disabled. See [RESTORE](RESTORE.md). Avoid force-stopping the launcher while testing accessibility; service state and injected Home events are not proof of physical-remote behavior.
