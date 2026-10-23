# Set up Purify Your TV with a coding assistant

## Easy copy-and-paste prompt

Use this with Claude Code, ChatGPT/Codex, or any coding agent with terminal access. Keep device addresses and authorization details out of public issues.

```text
Help me set up Purify Your TV from https://github.com/ADados/purify-your-tv on my own TV. Read README.md and PROMPT.md first. Ask me for my TV model and connection details, check compatibility, then guide me through debugging authorization, backup, building and installation. Ask before changing my TV or enabling the optional Home helper. Help me choose a theme and masjid, test the physical remote and restart, and close debugging afterward. Preserve all existing apps, settings and other accessibility services. Do not root, uninstall apps, disable Amazon Home, clear app data or bypass protections. Stop and explain if my device is unsupported.
```

A chat-only assistant without terminal/device access can guide you, but cannot perform installation. The agent also needs access to this repository. The detailed instructions below are for the agent to follow.

## Goal

Build and install this repository's prayer launcher on my own TV. Let me choose a theme and masjid. If my model supports the optional Home helper, explain its accessibility permission and get approval before enabling it. Do not remove apps or disable the stock launcher.

## Procedure

1. Read README.md and docs/SETUP.md. Identify whether the device is Fire OS, Android/Google TV, Tizen or webOS. Stop if this APK is incompatible. Do not translate Samsung development-mode/root procedures into Android commands.
2. Ask for the TV's address and permission to connect. Guide me through Developer Options and ADB debugging. I accept the authorization prompt on the TV; do not bypass it. Use a trusted LAN, not port forwarding.
3. Run `tools/tv.py --device <address>:5555 doctor` and `backup`. Keep backup data local. Confirm model, Android version and firmware; do not publish serials, account data or raw property dumps.
4. Build from the checked source using docs/BUILD.md. Keep signing keys private and reuse a previous installation's original key. Never uninstall or clear data to evade a signing mismatch.
5. Explain the change and get approval, then install in place with `tools/tv.py ... install`. Launch the app. Never disable Amazon Home or set the Android HOME role on Fire TV.
6. Show the dashboard. Ask me to test physical arrows, OK, Back, YouTube and system settings. Repeated Back should stay in Purify Your TV. Amazon Home remains an explicit escape button.
7. Explain settings: five persistent themes, search by name/city for existing Royyaa records, ID lookup for a new masjid. No masjid is preselected. Confirm the returned name/address/timezone before selection. Never assume an example ID belongs to my masjid. Ask which masjid I actually want.
8. Check begins vs Iqamah, all Friday sessions, next-Iqamah countdown, selected timezone and stale/offline labels. Do not invent missing times. Royyaa data must be attributed below the timetable.
9. Only with approval, use `helper-on` to enable this app's Home helper, preserving all existing services. It observes only Amazon Home window changes; it does not become the system Home handler or read screen content.
10. Ask me to open YouTube and press physical Home. A brief Amazon flash can happen. Test system settings and the explicit Amazon Home escape separately. A simulated key event is not physical-remote proof.
11. Ask me to restart by holding Power until the device logo appears. Wait for startup without manually opening the launcher. Ask me to test physical Home again. The TV-only helper uses a boot probe; no Mac/PC service should be installed.
12. Explain recovery in docs/RESTORE.md. Then have me turn off ADB/network/USB debugging and revoke authorizations. Confirm port access is closed; do not claim the installed helper needs debugging to stay enabled.

## Stop conditions

Unauthorized/offline device, unsupported OS, installation/signature failure, missing permission, unavailable timetable, or Home behavior that cannot be verified. Report the limitation. Do not root, flash firmware, disable core packages, factory-reset, brute-force credentials, bypass app protection or install an unreviewed startup hack.
