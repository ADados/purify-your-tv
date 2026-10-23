# Return to Amazon Home safely

Amazon's launcher is never disabled by this project. You do not need a factory reset or package uninstall.

1. Select **Amazon Home** in the dashboard for a ten-minute bypass. Reopening Purify Your TV resumes routing.
2. For a lasting return, choose **Home helper → Turn off**, or disable **Purify Your TV button helper** in Fire TV Accessibility.
3. If using authorized ADB, run:

   ```sh
   python3 tools/tv.py --device <TV_IP>:5555 helper-off
   ```

   This removes only this app's component, preserving other accessibility services. It does not blindly restore an old global list or change the HOME role.
4. Press Home and confirm Amazon. Keep Purify Your TV installed if you want to open it manually; themes and masjid choices remain saved.
5. Turn off debugging and revoke authorizations after finishing.

`tools/restore.sh <TV_IP>:5555` is a convenience wrapper for helper-off. On Windows use the Python command directly. It asks for confirmation before changing settings.

Local backups include the previous APK when present, but not the private app database/preferences. If rolling back an APK, keep its original signing identity and stop if Android rejects the downgrade. Do not clear data, uninstall or factory-reset to force it. An in-place update signed by the same original key is the normal recovery route.
