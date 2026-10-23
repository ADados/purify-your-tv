package local.simplehome.firetv;

import android.app.Activity;
import android.os.Bundle;

public final class HomeProbeActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        finish();
        overridePendingTransition(0, 0);
    }
}
