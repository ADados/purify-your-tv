package local.simplehome.firetv;

import android.accessibilityservice.AccessibilityService;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.os.UserManager;
import android.provider.Settings;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;

public final class HomeReturnService extends AccessibilityService {
    static final String AMAZON_PACKAGE = "com.amazon.tv.launcher";
    static final String AMAZON_HOME = "com.amazon.tv.launcher.ui.HomeActivity_vNext";
    private static volatile HomeReturnService connected;
    private static long bypassUntil;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private long lastRedirect;
    private BroadcastReceiver unlockReceiver;

    static boolean isConnected() { return connected != null; }
    static void pauseForAmazonHome() { bypassUntil = SystemClock.elapsedRealtime() + 600000; }
    static void pauseForSettings() { bypassUntil = Math.max(bypassUntil, SystemClock.elapsedRealtime() + 3000); }
    static void resumeRouting() { bypassUntil = 0; }
    static void turnOff() {
        HomeReturnService service = connected;
        if (service != null) {
            service.handler.removeCallbacksAndMessages(null);
            service.disableSelf();
        }
    }

    @Override protected void onServiceConnected() {
        super.onServiceConnected();
        connected = this;
        Log.i("SimpleHomeHelper", "Home helper connected; Amazon Home window events only");
        UserManager users = getSystemService(UserManager.class);
        if (users.isUserUnlocked()) probeAtBoot();
        else {
            unlockReceiver = new BroadcastReceiver() {
                @Override public void onReceive(Context context, Intent intent) {
                    stopWaitingForUnlock();
                    probeAtBoot();
                }
            };
            if (Build.VERSION.SDK_INT >= 33) {
                registerReceiver(unlockReceiver, new IntentFilter(Intent.ACTION_USER_UNLOCKED), Context.RECEIVER_NOT_EXPORTED);
            } else registerReceiver(unlockReceiver, new IntentFilter(Intent.ACTION_USER_UNLOCKED));
            if (users.isUserUnlocked()) {
                stopWaitingForUnlock();
                probeAtBoot();
            }
        }
    }

    private void stopWaitingForUnlock() {
        if (unlockReceiver != null) {
            unregisterReceiver(unlockReceiver);
            unlockReceiver = null;
        }
    }

    private void probeAtBoot() {
        int boot = Settings.Global.getInt(getContentResolver(), Settings.Global.BOOT_COUNT, -1);
        SharedPreferences record = createDeviceProtectedStorageContext().getSharedPreferences("home-helper-boot", MODE_PRIVATE);
        if (boot < 0 || boot == record.getInt("boot", -1) || SystemClock.elapsedRealtime() > 180000) return;
        record.edit().putInt("boot", boot).apply();
        handler.postDelayed(() -> {
            try {
                startActivity(new Intent(this, HomeProbeActivity.class)
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_ANIMATION));
            } catch (RuntimeException error) { Log.w("SimpleHomeHelper", "Boot probe could not start"); }
        }, 500);
    }

    @Override public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                || !AMAZON_PACKAGE.contentEquals(event.getPackageName() == null ? "" : event.getPackageName())) return;
        String window = event.getClassName() == null ? "" : event.getClassName().toString();
        if (!AMAZON_HOME.equals(window)) {
            handler.removeCallbacksAndMessages(null);
            if (window.equals("com.amazon.tv.launcher.ui.SettingsActivity")) pauseForSettings();
            return;
        }
        long now = SystemClock.elapsedRealtime();
        if (now < bypassUntil || now - lastRedirect < 1200 || !getSystemService(UserManager.class).isUserUnlocked()) return;
        lastRedirect = now;
        handler.removeCallbacksAndMessages(null);
        handler.postDelayed(() -> {
            if (SystemClock.elapsedRealtime() < bypassUntil) return;
            try {
                startActivity(new Intent(this, MainActivity.class)
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED));
                Log.i("SimpleHomeHelper", "Amazon Home redirected to prayer dashboard");
            } catch (RuntimeException error) { Log.w("SimpleHomeHelper", "Dashboard could not be opened"); }
        }, 100);
    }

    @Override public void onInterrupt() { handler.removeCallbacksAndMessages(null); }

    @Override public void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        stopWaitingForUnlock();
        if (connected == this) connected = null;
        super.onDestroy();
    }
}
