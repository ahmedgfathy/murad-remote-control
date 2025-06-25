package com.remotecontrol.guest.services;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.graphics.PointF;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

import com.remotecontrol.guest.models.ControlEvent;
import com.remotecontrol.guest.models.TouchEvent;
import com.remotecontrol.guest.models.KeyEvent;
import com.remotecontrol.guest.utils.EventBroadcaster;

public class RemoteControlAccessibilityService extends AccessibilityService {
    
    private static final String TAG = "RemoteControlAccessibility";
    private static RemoteControlAccessibilityService instance;
    
    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        Log.d(TAG, "Accessibility service connected");
        
        // Register for control events
        EventBroadcaster.getInstance().setControlEventListener(this::handleControlEvent);
    }
    
    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // We don't need to handle accessibility events for remote control
        // This service is primarily used for gesture injection
    }
    
    @Override
    public void onInterrupt() {
        Log.d(TAG, "Accessibility service interrupted");
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
        Log.d(TAG, "Accessibility service destroyed");
    }
    
    public static RemoteControlAccessibilityService getInstance() {
        return instance;
    }
    
    public void handleControlEvent(ControlEvent event) {
        if (event == null) return;
        
        switch (event.getType()) {
            case "touch":
                handleTouchEvent(event.getTouchData());
                break;
            case "key":
                handleKeyEvent(event.getKeyData());
                break;
            case "scroll":
                handleScrollEvent(event.getScrollData());
                break;
            default:
                Log.w(TAG, "Unknown control event type: " + event.getType());
        }
    }
    
    private void handleTouchEvent(TouchEvent touchEvent) {
        if (touchEvent == null) return;
        
        try {
            float x = touchEvent.getX();
            float y = touchEvent.getY();
            String action = touchEvent.getAction();
            
            Log.d(TAG, "Touch event: " + action + " at (" + x + ", " + y + ")");
            
            if ("down".equals(action) || "up".equals(action)) {
                performTap(x, y);
            } else if ("move".equals(action)) {
                // For move events, we could implement drag gestures
                // This is more complex and requires tracking start/end points
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error handling touch event", e);
        }
    }
    
    private void handleKeyEvent(KeyEvent keyEvent) {
        if (keyEvent == null) return;
        
        try {
            int keyCode = keyEvent.getKeyCode();
            String action = keyEvent.getAction();
            
            Log.d(TAG, "Key event: " + action + " keyCode: " + keyCode);
            
            // Perform global actions for common keys
            switch (keyCode) {
                case android.view.KeyEvent.KEYCODE_BACK:
                    performGlobalAction(GLOBAL_ACTION_BACK);
                    break;
                case android.view.KeyEvent.KEYCODE_HOME:
                    performGlobalAction(GLOBAL_ACTION_HOME);
                    break;
                case android.view.KeyEvent.KEYCODE_MENU:
                    performGlobalAction(GLOBAL_ACTION_RECENTS);
                    break;
                default:
                    // For other keys, we might need more complex handling
                    Log.w(TAG, "Unhandled key code: " + keyCode);
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error handling key event", e);
        }
    }
    
    private void handleScrollEvent(Object scrollData) {
        // Implement scroll handling if needed
        Log.d(TAG, "Scroll event received (not implemented)");
    }
    
    private void performTap(float x, float y) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            Path clickPath = new Path();
            clickPath.moveTo(x, y);
            
            GestureDescription.StrokeDescription clickStroke = 
                new GestureDescription.StrokeDescription(clickPath, 0, 100);
            
            GestureDescription.Builder gestureBuilder = new GestureDescription.Builder();
            gestureBuilder.addStroke(clickStroke);
            
            boolean result = dispatchGesture(gestureBuilder.build(), new GestureResultCallback() {
                @Override
                public void onCompleted(GestureDescription gestureDescription) {
                    Log.d(TAG, "Tap gesture completed");
                }
                
                @Override
                public void onCancelled(GestureDescription gestureDescription) {
                    Log.w(TAG, "Tap gesture cancelled");
                }
            }, null);
            
            if (!result) {
                Log.e(TAG, "Failed to dispatch tap gesture");
            }
        } else {
            Log.w(TAG, "Gesture dispatch not supported on this Android version");
        }
    }
    
    public void performSwipe(PointF start, PointF end, long duration) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            Path swipePath = new Path();
            swipePath.moveTo(start.x, start.y);
            swipePath.lineTo(end.x, end.y);
            
            GestureDescription.StrokeDescription swipeStroke = 
                new GestureDescription.StrokeDescription(swipePath, 0, duration);
            
            GestureDescription.Builder gestureBuilder = new GestureDescription.Builder();
            gestureBuilder.addStroke(swipeStroke);
            
            dispatchGesture(gestureBuilder.build(), null, null);
        }
    }
}
