package com.remotecontrol.guest.models;

public class TouchEvent {
    private String action; // "down", "up", "move"
    private float x;
    private float y;
    private float pressure;
    private long timestamp;
    
    public TouchEvent() {}
    
    public TouchEvent(String action, float x, float y, long timestamp) {
        this.action = action;
        this.x = x;
        this.y = y;
        this.timestamp = timestamp;
    }
    
    // Getters and setters
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public float getX() {
        return x;
    }
    
    public void setX(float x) {
        this.x = x;
    }
    
    public float getY() {
        return y;
    }
    
    public void setY(float y) {
        this.y = y;
    }
    
    public float getPressure() {
        return pressure;
    }
    
    public void setPressure(float pressure) {
        this.pressure = pressure;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
