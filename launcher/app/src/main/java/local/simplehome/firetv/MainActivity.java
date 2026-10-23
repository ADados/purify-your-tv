package local.simplehome.firetv;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.view.inputmethod.InputConnectionWrapper;
import android.view.inputmethod.InputMethodManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.chrono.HijrahDate;
import java.time.temporal.ChronoField;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import javax.net.ssl.HttpsURLConnection;

public final class MainActivity extends Activity {
    private WebView browser;
    private final Map<String, ComponentName> applications = new ConcurrentHashMap<>();
    private final ExecutorService requests = Executors.newFixedThreadPool(3);
    private final AtomicBoolean fetching = new AtomicBoolean();
    private final AtomicInteger masjidRequests = new AtomicInteger();

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        browser = new WebView(this) {
            @Override public InputConnection onCreateInputConnection(EditorInfo attributes) {
                InputConnection connection = super.onCreateInputConnection(attributes);
                if (connection == null) return null;
                attributes.imeOptions = (attributes.imeOptions & ~(EditorInfo.IME_MASK_ACTION
                        | EditorInfo.IME_FLAG_NAVIGATE_NEXT | EditorInfo.IME_FLAG_NAVIGATE_PREVIOUS))
                        | EditorInfo.IME_ACTION_SEARCH;
                attributes.actionLabel = localized("Search", "بحث");
                attributes.actionId = EditorInfo.IME_ACTION_SEARCH;
                return new InputConnectionWrapper(connection, false) {
                    @Override public boolean performEditorAction(int action) {
                        if (action == EditorInfo.IME_ACTION_NEXT || action == EditorInfo.IME_ACTION_SEARCH
                                || action == EditorInfo.IME_ACTION_DONE || action == EditorInfo.IME_ACTION_GO) {
                            runOnUiThread(() -> {
                                if (!isDestroyed()) browser.evaluateJavascript(
                                        "window.LauncherSettings && window.LauncherSettings.submitFocusedSearch()", null);
                            });
                            return true;
                        }
                        return super.performEditorAction(action);
                    }
                };
            }
        };
        browser.setBackgroundColor(0xff092d31);
        browser.getSettings().setJavaScriptEnabled(true);
        browser.getSettings().setDomStorageEnabled(true);
        browser.getSettings().setAllowFileAccess(false);
        browser.getSettings().setAllowContentAccess(false);
        browser.getSettings().setAllowFileAccessFromFileURLs(false);
        browser.getSettings().setAllowUniversalAccessFromFileURLs(false);
        browser.getSettings().setBlockNetworkLoads(true);
        browser.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true;
            }
        });
        browser.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage message) {
                Log.d("SimpleHome", message.message() + " at " + message.lineNumber());
                return true;
            }
        });
        browser.addJavascriptInterface(new Bridge(), "TV");
        setContentView(browser);
        browser.loadUrl("file:///android_asset/index.html");
        browser.requestFocus();
    }

    private String icon(Drawable drawable) {
        Bitmap bitmap = Bitmap.createBitmap(96, 96, Bitmap.Config.ARGB_8888);
        drawable.setBounds(0, 0, 96, 96);
        drawable.draw(new Canvas(bitmap));
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, output);
        bitmap.recycle();
        return "data:image/png;base64," + Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP);
    }

    private void amazonHome() {
        HomeReturnService.pauseForAmazonHome();
        if (HomeReturnService.isConnected()) Toast.makeText(this,
                localized("Amazon Home allowed for 10 minutes. Open Purify Your TV to resume the helper.",
                        "يمكن استخدام واجهة أمازون لعشر دقائق. افتح Purify Your TV لاستئناف المساعد."), Toast.LENGTH_LONG).show();
        Intent home = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
                .setPackage("com.amazon.tv.launcher").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try { startActivity(home); }
        catch (RuntimeException error) { finish(); }
    }

    public final class Bridge {
        @JavascriptInterface public void setLanguage(String language) {
            if ("en".equals(language) || "ar".equals(language)) {
                getSharedPreferences("launcher-language", MODE_PRIVATE).edit().putString("language", language).apply();
            }
        }

        @JavascriptInterface public void dismissKeyboard() {
            runOnUiThread(() -> {
                InputMethodManager keyboard = (InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
                if (keyboard != null) keyboard.hideSoftInputFromWindow(browser.getWindowToken(), 0);
            });
        }

        @JavascriptInterface public String getHijriDate(boolean afterMaghrib) {
            return getHijriDateForZone(afterMaghrib, "America/Detroit");
        }

        @JavascriptInterface public String getHijriDateForZone(boolean afterMaghrib, String timezone) {
            try {
                LocalDate date = LocalDate.now(ZoneId.of(timezone));
                HijrahDate hijri = HijrahDate.from(afterMaghrib ? date.plusDays(1) : date);
                String[] months = {"Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
                        "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha’ban", "Ramadan",
                        "Shawwal", "Dhu al-Qi’dah", "Dhu al-Hijjah"};
                if ("ar".equals(getSharedPreferences("launcher-language", MODE_PRIVATE).getString("language", "en"))) {
                    months = new String[]{"محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
                            "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"};
                }
                return hijri.get(ChronoField.DAY_OF_MONTH) + " "
                        + months[hijri.get(ChronoField.MONTH_OF_YEAR) - 1] + " "
                        + hijri.get(ChronoField.YEAR_OF_ERA) + localized(" AH", " هـ");
            } catch (RuntimeException error) { return localized("Hijri date unavailable", "التاريخ الهجري غير متاح"); }
        }

        @JavascriptInterface public String getApps() {
            JSONArray result = new JSONArray();
            PackageManager manager = getPackageManager();
            Map<String, ResolveInfo> found = new java.util.HashMap<>();
            for (String category : new String[]{Intent.CATEGORY_LAUNCHER, Intent.CATEGORY_LEANBACK_LAUNCHER}) {
                Intent query = new Intent(Intent.ACTION_MAIN).addCategory(category);
                for (ResolveInfo activity : manager.queryIntentActivities(query, 0)) {
                    String name = activity.activityInfo.packageName;
                    if (!name.equals(getPackageName()) && activity.activityInfo.exported) found.put(name, activity);
                }
            }
            List<ResolveInfo> sorted = new ArrayList<>(found.values());
            sorted.sort(Comparator.comparing(activity -> activity.loadLabel(manager).toString(), String.CASE_INSENSITIVE_ORDER));
            for (ResolveInfo activity : sorted) {
                try {
                    String name = activity.activityInfo.packageName;
                    applications.put(name, new ComponentName(name, activity.activityInfo.name));
                    JSONObject item = new JSONObject();
                    item.put("packageName", name);
                    item.put("label", activity.loadLabel(manager).toString());
                    item.put("icon", icon(activity.loadIcon(manager)));
                    result.put(item);
                } catch (Exception error) { Log.w("SimpleHome", "Could not read app icon"); }
            }
            return result.toString();
        }

        @JavascriptInterface public void launchApp(String packageName) {
            ComponentName component = applications.get(packageName);
            if (component == null) return;
            runOnUiThread(() -> {
                try {
                    startActivity(new Intent(Intent.ACTION_MAIN).setComponent(component)
                            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED));
                } catch (RuntimeException error) {
                    Toast.makeText(MainActivity.this, localized("This app could not be opened", "تعذر فتح هذا التطبيق"), Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface public void openAmazonHome() { runOnUiThread(() -> amazonHome()); }

        @JavascriptInterface public void homeHelperSettings() {
            runOnUiThread(() -> {
                boolean active = HomeReturnService.isConnected();
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle(localized("Home-button helper", "مساعد زر الرئيسية"))
                        .setMessage(active
                                ? localized("Home opens your prayer dashboard. Amazon Settings remains accessible. Turn this helper off to restore Amazon Home normally.",
                                        "زر الرئيسية يفتح مواقيت الصلاة. تظل إعدادات أمازون متاحة. أوقف المساعد للعودة إلى واجهة أمازون المعتادة.")
                                : localized("The helper is not connected. You can enable Purify Your TV button helper in Accessibility settings.",
                                        "المساعد غير متصل. يمكنك تفعيل مساعد Purify Your TV من إعدادات تسهيل الاستخدام."))
                        .setPositiveButton(active ? localized("Turn off", "إيقاف") : localized("Accessibility settings", "إعدادات تسهيل الاستخدام"), (dialog, which) -> {
                            if (active) HomeReturnService.turnOff();
                            else {
                                try { startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)); }
                                catch (RuntimeException error) { amazonHome(); }
                            }
                        })
                        .setNegativeButton(localized("Cancel", "إلغاء"), null).show();
            });
        }

        @JavascriptInterface public void openSettings() {
            runOnUiThread(() -> {
                HomeReturnService.pauseForSettings();
                try { startActivity(new Intent(Settings.ACTION_SETTINGS)); }
                catch (RuntimeException error) { amazonHome(); }
            });
        }

        @JavascriptInterface public void refreshPrayers() {
            if (!fetching.compareAndSet(false, true)) return;
            requests.execute(() -> {
                JSONObject result = new JSONObject();
                HttpsURLConnection connection = null;
                try {
                    connection = (HttpsURLConnection) new URL("https://www.mcws.org/").openConnection();
                    connection.setConnectTimeout(10000);
                    connection.setReadTimeout(15000);
                    connection.setRequestProperty("Cache-Control", "no-cache");
                    connection.setInstanceFollowRedirects(false);
                    int status = connection.getResponseCode();
                    if (status != 200) throw new java.io.IOException("Timetable unavailable");
                    ByteArrayOutputStream output = new ByteArrayOutputStream();
                    try (InputStream input = connection.getInputStream()) {
                        byte[] buffer = new byte[8192];
                        int count;
                        while ((count = input.read(buffer)) != -1) {
                            if (output.size() + count > 1048576) throw new java.io.IOException("Timetable too large");
                            output.write(buffer, 0, count);
                        }
                    }
                    result.put("html", output.toString(StandardCharsets.UTF_8.name()));
                    result.put("date", connection.getHeaderField("Date"));
                } catch (Exception error) {
                    try { result.put("error", "MCWS could not be reached"); }
                    catch (org.json.JSONException ignored) { }
                } finally {
                    if (connection != null) connection.disconnect();
                    fetching.set(false);
                }
                String payload = result.toString().replace("\u2028", "\\u2028").replace("\u2029", "\\u2029");
                runOnUiThread(() -> {
                    if (!isDestroyed()) browser.evaluateJavascript("window.onPrayerResponse(" + payload + ")", null);
                });
            });
        }

        @JavascriptInterface public void searchMasjids(int requestId, String value, boolean byId) {
            try {
                String query = value == null ? "" : value.trim();
                if (byId ? !query.matches("[A-Za-z0-9_-]{1,64}") : query.length() < 2 || query.length() > 100) {
                    sendRoyyaa(requestId, null, "Enter a valid Masjidal ID or at least two search characters.");
                    return;
                }
                requestRoyyaa(requestId, "/search?" + (byId ? "id=" : "q=")
                        + URLEncoder.encode(query, "UTF-8") + (byId ? "" : "&limit=20"));
            } catch (Exception error) { sendRoyyaa(requestId, null, "Invalid search."); }
        }

        @JavascriptInterface public void fetchMasjidPrayers(int requestId, String masjidalId, String date) {
            try {
                if (masjidalId == null || !masjidalId.matches("[A-Za-z0-9_-]{1,64}")
                        || date == null || !date.matches("\\d{4}-\\d{2}-\\d{2}")) throw new IllegalArgumentException();
                LocalDate.parse(date);
                requestRoyyaa(requestId, "/" + masjidalId + "/prayer-times?date=" + date + "&days=7");
            } catch (RuntimeException error) { sendRoyyaa(requestId, null, "Invalid masjid or date."); }
        }
    }

    private String localized(String english, String arabic) {
        return "ar".equals(getSharedPreferences("launcher-language", MODE_PRIVATE).getString("language", "en")) ? arabic : english;
    }

    private void sendRoyyaa(int requestId, JSONObject data, String error) {
        try {
            JSONObject response = new JSONObject();
            response.put("requestId", requestId);
            if (error != null) response.put("error", error);
            else response.put("data", data);
            String payload = response.toString().replace("\u2028", "\\u2028").replace("\u2029", "\\u2029");
            runOnUiThread(() -> {
                if (!isDestroyed()) browser.evaluateJavascript("window.onRoyyaaResponse && window.onRoyyaaResponse(" + payload + ")", null);
            });
        } catch (org.json.JSONException ignored) { }
    }

    private void requestRoyyaa(int requestId, String path) {
        if (masjidRequests.incrementAndGet() > 2) {
            masjidRequests.decrementAndGet();
            sendRoyyaa(requestId, null, "Please wait for the current masjid requests to finish.");
            return;
        }
        requests.execute(() -> {
            HttpsURLConnection connection = null;
            try {
                connection = (HttpsURLConnection) new URL("https://www.royyaa.com/api/public/masjids" + path).openConnection();
                connection.setRequestMethod("GET");
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(15000);
                connection.setInstanceFollowRedirects(false);
                connection.setRequestProperty("Accept", "application/json");
                int status = connection.getResponseCode();
                if (status != 200) {
                    sendRoyyaa(requestId, null, status == 404 ? "Masjid not found. Check the Masjidal ID." : "Masjid service unavailable. Try again.");
                    return;
                }
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                try (InputStream input = connection.getInputStream()) {
                    byte[] buffer = new byte[8192];
                    int count;
                    while ((count = input.read(buffer)) != -1) {
                        if (output.size() + count > 1048576) throw new java.io.IOException("Response too large");
                        output.write(buffer, 0, count);
                    }
                }
                sendRoyyaa(requestId, new JSONObject(output.toString(StandardCharsets.UTF_8.name())), null);
            } catch (Exception error) { sendRoyyaa(requestId, null, "Could not reach Royyaa. Check your connection."); }
            finally {
                if (connection != null) connection.disconnect();
                masjidRequests.decrementAndGet();
            }
        });
    }

    @Override public void onBackPressed() {
        browser.evaluateJavascript("window.SimpleHomeBack && window.SimpleHomeBack()", null);
    }

    @Override protected void onResume() {
        super.onResume();
        HomeReturnService.resumeRouting();
        if (browser != null) {
            browser.onResume();
            browser.evaluateJavascript("window.onTVResume && window.onTVResume()", null);
        }
    }

    @Override protected void onPause() {
        if (browser != null) browser.onPause();
        super.onPause();
    }

    @Override protected void onDestroy() {
        requests.shutdownNow();
        if (browser != null) {
            browser.removeJavascriptInterface("TV");
            browser.destroy();
        }
        super.onDestroy();
    }
}
