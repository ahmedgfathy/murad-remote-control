package com.remotecontrol.guest;

import android.Manifest;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.media.projection.MediaProjectionManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.remotecontrol.guest.services.ScreenCaptureService;
import com.remotecontrol.guest.services.WebSocketService;
import com.remotecontrol.guest.services.RemoteControlAccessibilityService;
import com.remotecontrol.guest.utils.SessionManager;

public class MainActivity extends AppCompatActivity {

    private static final int REQUEST_CODE_SCREEN_CAPTURE = 1000;
    private static final int REQUEST_CODE_OVERLAY_PERMISSION = 1001;
    private static final int REQUEST_CODE_ACCESSIBILITY = 1002;
    private static final int REQUEST_CODE_PERMISSIONS = 1003;

    private TextView statusText;
    private TextView sessionCodeText;
    private Button startButton;
    private Button stopButton;
    private Button settingsButton;

    private SessionManager sessionManager;
    private boolean isServiceRunning = false;
    
    private BroadcastReceiver sessionCodeReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("SESSION_CODE_RECEIVED".equals(intent.getAction())) {
                String sessionCode = intent.getStringExtra("sessionCode");
                Log.d("MainActivity", "Received session code: " + sessionCode);
                runOnUiThread(() -> {
                    updateUI();
                    Toast.makeText(MainActivity.this, "Session Code: " + sessionCode, Toast.LENGTH_LONG).show();
                });
            } else if ("CONTROLLER_JOINED".equals(intent.getAction())) {
                String controllerId = intent.getStringExtra("controllerId");
                Log.d("MainActivity", "Controller joined: " + controllerId);
                runOnUiThread(() -> {
                    Toast.makeText(MainActivity.this, "Controller connected!", Toast.LENGTH_SHORT).show();
                });
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initializeViews();
        sessionManager = SessionManager.getInstance(this);
        
        // Register broadcast receiver for session code updates
        IntentFilter filter = new IntentFilter();
        filter.addAction("SESSION_CODE_RECEIVED");
        filter.addAction("CONTROLLER_JOINED");
        registerReceiver(sessionCodeReceiver, filter);
        
        checkPermissions();
        updateUI();
    }

    private void initializeViews() {
        statusText = findViewById(R.id.status_text);
        sessionCodeText = findViewById(R.id.session_code_text);
        startButton = findViewById(R.id.start_button);
        stopButton = findViewById(R.id.stop_button);
        settingsButton = findViewById(R.id.settings_button);

        startButton.setOnClickListener(v -> startRemoteControl());
        stopButton.setOnClickListener(v -> stopRemoteControl());
        settingsButton.setOnClickListener(v -> openAccessibilitySettings());
    }

    private void checkPermissions() {
        // Request battery optimization exclusion (especially important for Xiaomi/MIUI)
        requestBatteryOptimizationExclusion();
        
        // Check overlay permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(this)) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + getPackageName()));
                startActivityForResult(intent, REQUEST_CODE_OVERLAY_PERMISSION);
                return;
            }
        }

        // Check basic permissions
        String[] permissions = {
                Manifest.permission.WRITE_EXTERNAL_STORAGE,
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.RECORD_AUDIO,
                Manifest.permission.CAMERA,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.READ_PHONE_STATE,
                Manifest.permission.ACCESS_WIFI_STATE,
                Manifest.permission.CHANGE_WIFI_STATE
        };

        boolean allGranted = true;
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }

        if (!allGranted) {
            ActivityCompat.requestPermissions(this, permissions, REQUEST_CODE_PERMISSIONS);
        }
    }

    private void startRemoteControl() {
        // Skip all permission checks for now - just go straight to screen capture
        Toast.makeText(this, "Starting screen capture...", Toast.LENGTH_SHORT).show();
        MediaProjectionManager manager = (MediaProjectionManager) getSystemService(MEDIA_PROJECTION_SERVICE);
        Intent captureIntent = manager.createScreenCaptureIntent();
        startActivityForResult(captureIntent, REQUEST_CODE_SCREEN_CAPTURE);
    }

    private boolean hasBasicPermissions() {
        String[] permissions = {
                Manifest.permission.WRITE_EXTERNAL_STORAGE,
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.RECORD_AUDIO,
                Manifest.permission.CAMERA,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.READ_PHONE_STATE,
                Manifest.permission.ACCESS_WIFI_STATE,
                Manifest.permission.CHANGE_WIFI_STATE
        };

        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    private void stopRemoteControl() {
        // Stop services
        stopService(new Intent(this, ScreenCaptureService.class));
        stopService(new Intent(this, WebSocketService.class));
        
        isServiceRunning = false;
        sessionManager.endSession();
        updateUI();
        
        Toast.makeText(this, "Remote control stopped", Toast.LENGTH_SHORT).show();
    }

    private void openAccessibilitySettings() {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        startActivityForResult(intent, REQUEST_CODE_ACCESSIBILITY);
    }

    private boolean hasAllPermissions() {
        // Check overlay permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(this)) {
                return false;
            }
        }

        // Check accessibility service
        if (!isAccessibilityServiceEnabled()) {
            return false;
        }

        // Check basic permissions
        String[] permissions = {
                Manifest.permission.WRITE_EXTERNAL_STORAGE,
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.RECORD_AUDIO,
                Manifest.permission.CAMERA,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.READ_PHONE_STATE,
                Manifest.permission.ACCESS_WIFI_STATE,
                Manifest.permission.CHANGE_WIFI_STATE
        };

        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }

        return true;
    }

    private boolean isAccessibilityServiceEnabled() {
        // First try to check if our service instance is running
        if (RemoteControlAccessibilityService.getInstance() != null) {
            Log.d("MainActivity", "Accessibility service detected via instance");
            return true;
        }
        
        try {
            int accessibilityEnabled = Settings.Secure.getInt(
                    getContentResolver(), Settings.Secure.ACCESSIBILITY_ENABLED);
            
            if (accessibilityEnabled == 1) {
                // Try multiple possible service name formats
                String packageName = getPackageName();
                String[] possibleServiceNames = {
                    packageName + "/com.remotecontrol.guest.services.RemoteControlAccessibilityService",
                    packageName + "/.services.RemoteControlAccessibilityService",
                    "com.remotecontrol.guest/com.remotecontrol.guest.services.RemoteControlAccessibilityService",
                    "com.remotecontrol.guest/.services.RemoteControlAccessibilityService"
                };
                
                String enabledServices = Settings.Secure.getString(
                    getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
                
                Log.d("MainActivity", "Package name: " + packageName);
                Log.d("MainActivity", "Enabled services: " + enabledServices);
                
                if (enabledServices != null) {
                    for (String serviceName : possibleServiceNames) {
                        Log.d("MainActivity", "Checking service: " + serviceName);
                        if (enabledServices.contains(serviceName)) {
                            Log.d("MainActivity", "Found enabled service: " + serviceName);
                            return true;
                        }
                    }
                    
                    // Also check if the service class name appears anywhere in enabled services
                    if (enabledServices.contains("RemoteControlAccessibilityService")) {
                        Log.d("MainActivity", "Found service by class name");
                        return true;
                    }
                }
            }
        } catch (Settings.SettingNotFoundException e) {
            Log.e("MainActivity", "Settings not found", e);
            return false;
        } catch (Exception e) {
            Log.e("MainActivity", "Error checking accessibility service", e);
            return false;
        }
        
        Log.d("MainActivity", "Accessibility service not found");
        return false;
    }

    private String generateSessionCode() {
        // Generate 6-digit session code
        return String.format("%06d", (int)(Math.random() * 1000000));
    }

    private void requestBatteryOptimizationExclusion() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager != null && !powerManager.isIgnoringBatteryOptimizations(getPackageName())) {
                try {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + getPackageName()));
                    startActivity(intent);
                    Toast.makeText(this, "Please allow battery optimization exclusion for better performance", Toast.LENGTH_LONG).show();
                } catch (Exception e) {
                    Log.w("MainActivity", "Could not request battery optimization exclusion", e);
                    // Fallback: direct user to battery settings
                    try {
                        Intent intent = new Intent(Settings.ACTION_BATTERY_SAVER_SETTINGS);
                        startActivity(intent);
                        Toast.makeText(this, "Please exclude this app from battery optimization in settings", Toast.LENGTH_LONG).show();
                    } catch (Exception ex) {
                        Log.w("MainActivity", "Could not open battery settings", ex);
                    }
                }
            }
        }
    }

    private void updateUI() {
        if (isServiceRunning) {
            statusText.setText("🟢 Remote Control Active");
            String sessionCode = sessionManager.getCurrentSessionCode();
            if (sessionCode != null) {
                sessionCodeText.setText("Session Code: " + sessionCode);
                sessionCodeText.setVisibility(TextView.VISIBLE);
            } else {
                sessionCodeText.setVisibility(TextView.GONE);
            }
            startButton.setEnabled(false);
            stopButton.setEnabled(true);
            settingsButton.setEnabled(true);
        } else {
            statusText.setText("🔴 Remote Control Inactive - Tap Start");
            sessionCodeText.setVisibility(TextView.GONE);
            
            // Always enable buttons
            startButton.setEnabled(true);
            stopButton.setEnabled(false);
            settingsButton.setEnabled(true);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        switch (requestCode) {
            case REQUEST_CODE_SCREEN_CAPTURE:
                if (resultCode == Activity.RESULT_OK) {
                    // Start screen capture service
                    Intent serviceIntent = new Intent(this, ScreenCaptureService.class);
                    serviceIntent.putExtra("resultCode", resultCode);
                    serviceIntent.putExtra("data", data);
                    startForegroundService(serviceIntent);
                    
                    // Start WebSocket service
                    startService(new Intent(this, WebSocketService.class));
                    
                    // Generate temporary session code until server provides one
                    String tempSessionCode = generateSessionCode();
                    sessionManager.setCurrentSession(tempSessionCode);
                    
                    isServiceRunning = true;
                    updateUI();
                    
                    Toast.makeText(this, "Remote control started - Connecting...", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(this, "Screen capture permission denied", Toast.LENGTH_SHORT).show();
                }
                break;
                
            case REQUEST_CODE_OVERLAY_PERMISSION:
            case REQUEST_CODE_ACCESSIBILITY:
                updateUI();
                break;
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, 
                                         @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            updateUI();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        updateUI();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (sessionCodeReceiver != null) {
            unregisterReceiver(sessionCodeReceiver);
        }
    }
}
