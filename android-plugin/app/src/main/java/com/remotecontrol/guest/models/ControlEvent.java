package com.remotecontrol.guest.models;

public class ControlEvent {
    private String type;
    private TouchEvent touchData;
    private KeyEvent keyData;
    private Object scrollData;
    private long timestamp;
    
    public ControlEvent() {}
    
    public ControlEvent(String type, long timestamp) {
        this.type = type;
        this.timestamp = timestamp;
    }
    
    // Getters and setters
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public TouchEvent getTouchData() {
        return touchData;
    }
    
    public void setTouchData(TouchEvent touchData) {
        this.touchData = touchData;
    }
    
    public KeyEvent getKeyData() {
        return keyData;
    }
    
    public void setKeyData(KeyEvent keyData) {
        this.keyData = keyData;
    }
    
    public Object getScrollData() {
        return scrollData;
    }
    
    public void setScrollData(Object scrollData) {
        this.scrollData = scrollData;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
