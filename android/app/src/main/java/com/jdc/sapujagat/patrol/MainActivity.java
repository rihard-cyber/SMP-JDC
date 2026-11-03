package com.jdc.sapujagat.patrol;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DeviceSecurityPlugin.class);
        registerPlugin(TorchPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
