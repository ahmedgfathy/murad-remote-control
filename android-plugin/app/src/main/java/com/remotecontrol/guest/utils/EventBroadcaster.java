package com.remotecontrol.guest.utils;

import com.remotecontrol.guest.models.ControlEvent;

public class EventBroadcaster {
    private static EventBroadcaster instance;
    
    private FrameListener frameListener;
    private ControlEventListener controlEventListener;
    private QualityChangeListener qualityChangeListener;
    
    private EventBroadcaster() {}
    
    public static synchronized EventBroadcaster getInstance() {
        if (instance == null) {
            instance = new EventBroadcaster();
        }
        return instance;
    }
    
    // Frame broadcasting
    public interface FrameListener {
        void onFrameAvailable(byte[] frameData);
    }
    
    public void setFrameListener(FrameListener listener) {
        this.frameListener = listener;
    }
    
    public void broadcastFrame(byte[] frameData) {
        if (frameListener != null) {
            frameListener.onFrameAvailable(frameData);
        }
    }
    
    // Control event broadcasting
    public interface ControlEventListener {
        void onControlEvent(ControlEvent event);
    }
    
    public void setControlEventListener(ControlEventListener listener) {
        this.controlEventListener = listener;
    }
    
    public void broadcastControlEvent(ControlEvent event) {
        if (controlEventListener != null) {
            controlEventListener.onControlEvent(event);
        }
    }
    
    // Quality change broadcasting
    public interface QualityChangeListener {
        void onQualityChange(String quality);
    }
    
    public void setQualityChangeListener(QualityChangeListener listener) {
        this.qualityChangeListener = listener;
    }
    
    public void broadcastQualityChange(String quality) {
        if (qualityChangeListener != null) {
            qualityChangeListener.onQualityChange(quality);
        }
    }
}
