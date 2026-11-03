package com.jdc.sapujagat.patrol;

import android.content.Context;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

/**
 * Plugin native untuk menyalakan/mematikan flash kamera belakang.
 *
 * WebView di sebagian perangkat Android tidak mengekspos constraint "torch"
 * pada MediaStreamTrack. CameraManager.setTorchMode() bekerja langsung di
 * level hardware sehingga flash tetap bisa dinyalakan saat scanner aktif.
 */
@CapacitorPlugin(name = "Torch")
public class TorchPlugin extends Plugin {

    private CameraManager getCameraManager() {
        return (CameraManager) getContext().getSystemService(Context.CAMERA_SERVICE);
    }

    private List<String> getBackFlashCameraIds() {
        List<String> ids = new ArrayList<>();
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return ids;

        try {
            CameraManager manager = getCameraManager();
            for (String id : manager.getCameraIdList()) {
                try {
                    CameraCharacteristics characteristics = manager.getCameraCharacteristics(id);
                    Integer facing = characteristics.get(CameraCharacteristics.LENS_FACING);
                    Boolean hasFlash = characteristics.get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                    if (facing != null
                        && facing == CameraCharacteristics.LENS_FACING_BACK
                        && Boolean.TRUE.equals(hasFlash)) {
                        ids.add(id);
                    }
                } catch (Exception ignored) {
                    // Lewati kamera yang tidak bisa dibaca.
                }
            }
        } catch (Exception ignored) {
            // Kamera service tidak tersedia.
        }

        return ids;
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !getBackFlashCameraIds().isEmpty());
        ret.put("androidVersion", Build.VERSION.SDK_INT);
        call.resolve(ret);
    }

    @PluginMethod
    public void enable(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            call.reject("Flash membutuhkan Android 6.0 atau lebih baru.");
            return;
        }

        List<String> cameraIds = getBackFlashCameraIds();
        if (cameraIds.isEmpty()) {
            call.reject("Kamera belakang dengan flash tidak ditemukan.");
            return;
        }

        CameraManager manager = getCameraManager();
        for (String cameraId : cameraIds) {
            try {
                manager.setTorchMode(cameraId, true);
                JSObject ret = new JSObject();
                ret.put("enabled", true);
                ret.put("cameraId", cameraId);
                call.resolve(ret);
                return;
            } catch (Exception ignored) {
                // Coba kamera berikutnya (mis. kamera utama sibuk).
            }
        }

        call.reject("Flash tidak dapat diaktifkan. Perangkat sedang memakai kamera lain.");
    }

    @PluginMethod
    public void disable(PluginCall call) {
        boolean disabled = false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            CameraManager manager = getCameraManager();
            for (String cameraId : getBackFlashCameraIds()) {
                try {
                    manager.setTorchMode(cameraId, false);
                    disabled = true;
                } catch (Exception ignored) {
                    // Flash mungkin sudah mati atau tidak bisa diakses.
                }
            }
        }

        JSObject ret = new JSObject();
        ret.put("enabled", false);
        ret.put("disabled", disabled);
        call.resolve(ret);
    }

    private void turnOffTorchSilently() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;

        try {
            CameraManager manager = getCameraManager();
            for (String cameraId : getBackFlashCameraIds()) {
                try {
                    manager.setTorchMode(cameraId, false);
                } catch (Exception ignored) {
                    // Abaikan.
                }
            }
        } catch (Exception ignored) {
            // Abaikan.
        }
    }

    @Override
    protected void handleOnPause() {
        // Jangan biarkan lampu flash tertinggal menyala saat app ke background.
        turnOffTorchSilently();
        super.handleOnPause();
    }

    @Override
    protected void handleOnDestroy() {
        turnOffTorchSilently();
        super.handleOnDestroy();
    }
}
