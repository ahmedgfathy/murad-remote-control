package com.remotecontrol.guest.models;

public class KeyEvent {
    private String action; // "down", "up"
    private int keyCode;
    private int metaState;
    private long timestamp;
    
    public KeyEvent() {}
    
    public KeyEvent(String action, int keyCode, long timestamp) {
        this.action = action;
        this.keyCode = keyCode;
        this.timestamp = timestamp;
    }
    
    // Getters and setters
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public int getKeyCode() {
        return keyCode;
    }
    
    public void setKeyCode(int keyCode) {
        this.keyCode = keyCode;
    }
    
    public int getMetaState() {
        return metaState;
    }
    
    public void setMetaState(int metaState) {
        this.metaState = metaState;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
