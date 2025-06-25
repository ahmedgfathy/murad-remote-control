package com.remotecontrol.guest.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {
    private static final String PREF_NAME = "RemoteControlSession";
    private static final String KEY_AUTH_TOKEN = "auth_token";
    private static final String KEY_SESSION_CODE = "session_code";
    private static final String KEY_IS_ACTIVE = "is_active";
    
    private static SessionManager instance;
    private SharedPreferences preferences;
    private String currentSessionCode;
    private String authToken;
    private boolean isSessionActive;
    
    private SessionManager(Context context) {
        preferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        loadSession();
    }
    
    public static synchronized SessionManager getInstance(Context context) {
        if (instance == null) {
            instance = new SessionManager(context.getApplicationContext());
        }
        return instance;
    }
    
    public static synchronized SessionManager getInstance() {
        if (instance == null) {
            throw new IllegalStateException("SessionManager not initialized. Call getInstance(Context) first.");
        }
        return instance;
    }
    
    private void loadSession() {
        authToken = preferences.getString(KEY_AUTH_TOKEN, null);
        currentSessionCode = preferences.getString(KEY_SESSION_CODE, null);
        isSessionActive = preferences.getBoolean(KEY_IS_ACTIVE, false);
    }
    
    private void saveSession() {
        SharedPreferences.Editor editor = preferences.edit();
        editor.putString(KEY_AUTH_TOKEN, authToken);
        editor.putString(KEY_SESSION_CODE, currentSessionCode);
        editor.putBoolean(KEY_IS_ACTIVE, isSessionActive);
        editor.apply();
    }
    
    public void setAuthToken(String token) {
        this.authToken = token;
        saveSession();
    }
    
    public String getAuthToken() {
        return authToken;
    }
    
    public void setCurrentSession(String sessionCode) {
        this.currentSessionCode = sessionCode;
        this.isSessionActive = true;
        saveSession();
    }
    
    public String getCurrentSessionCode() {
        return currentSessionCode;
    }
    
    public boolean isSessionActive() {
        return isSessionActive && currentSessionCode != null;
    }
    
    public void endSession() {
        this.currentSessionCode = null;
        this.isSessionActive = false;
        saveSession();
    }
    
    public void clearAll() {
        this.authToken = null;
        this.currentSessionCode = null;
        this.isSessionActive = false;
        
        SharedPreferences.Editor editor = preferences.edit();
        editor.clear();
        editor.apply();
    }
}
