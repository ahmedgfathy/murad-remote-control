package com.remotecontrol.guest.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.PixelFormat;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.Image;
import android.media.ImageReader;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.WindowManager;

import androidx.core.app.NotificationCompat;

import com.remotecontrol.guest.R;
import com.remotecontrol.guest.utils.EventBroadcaster;
import com.remotecontrol.guest.utils.ImageEncoder;

import java.nio.ByteBuffer;

public class ScreenCaptureService extends Service {
    
    private static final String TAG = "ScreenCaptureService";
    private static final String CHANNEL_ID = "ScreenCaptureChannel";
    private static final int NOTIFICATION_ID = 1;
    
    private MediaProjection mediaProjection;
    private VirtualDisplay virtualDisplay;
    private ImageReader imageReader;
    private Handler backgroundHandler;
    private int screenWidth;
    private int screenHeight;
    private int screenDensity;
    
    // Frame rate control
    private static final int TARGET_FPS = 30;
    private static final long FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
    private long lastFrameTime = 0;
    
    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        
        // Get screen dimensions
        WindowManager windowManager = (WindowManager) getSystemService(Context.WINDOW_SERVICE);
        DisplayMetrics metrics = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(metrics);
        
        screenWidth = metrics.widthPixels;
        screenHeight = metrics.heightPixels;
        screenDensity = metrics.densityDpi;
        
        Log.d(TAG, "Screen dimensions: " + screenWidth + "x" + screenHeight + " density: " + screenDensity);
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            int resultCode = intent.getIntExtra("resultCode", -1);
            Intent data = intent.getParcelableExtra("data");
            
            if (resultCode != -1 && data != null) {
                startScreenCapture(resultCode, data);
                startForeground(NOTIFICATION_ID, createNotification());
            }
        }
        
        return START_STICKY;
    }
    
    private void startScreenCapture(int resultCode, Intent data) {
        MediaProjectionManager manager = (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
        mediaProjection = manager.getMediaProjection(resultCode, data);
        
        if (mediaProjection == null) {
            Log.e(TAG, "Failed to create MediaProjection");
            stopSelf();
            return;
        }
        
        // Create ImageReader for capturing frames
        imageReader = ImageReader.newInstance(screenWidth, screenHeight, PixelFormat.RGBA_8888, 2);
        
        // Set up image available listener
        imageReader.setOnImageAvailableListener(new ImageReader.OnImageAvailableListener() {
            @Override
            public void onImageAvailable(ImageReader reader) {
                processFrame();
            }
        }, getBackgroundHandler());
        
        // Create virtual display
        virtualDisplay = mediaProjection.createVirtualDisplay(
            "RemoteControlCapture",
            screenWidth,
            screenHeight,
            screenDensity,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            imageReader.getSurface(),
            null,
            getBackgroundHandler()
        );
        
        Log.d(TAG, "Screen capture started");
    }
    
    private void processFrame() {
        long currentTime = System.currentTimeMillis();
        if (currentTime - lastFrameTime < FRAME_INTERVAL_MS) {
            return; // Skip frame to maintain target FPS
        }
        lastFrameTime = currentTime;
        
        Image image = null;
        try {
            image = imageReader.acquireLatestImage();
            if (image != null) {
                Bitmap bitmap = convertImageToBitmap(image);
                if (bitmap != null) {
                    // Encode and broadcast the frame
                    byte[] encodedFrame = ImageEncoder.encodeBitmap(bitmap, 75); // 75% quality
                    EventBroadcaster.getInstance().broadcastFrame(encodedFrame);
                    bitmap.recycle();
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error processing frame", e);
        } finally {
            if (image != null) {
                image.close();
            }
        }
    }
    
    private Bitmap convertImageToBitmap(Image image) {
        Image.Plane[] planes = image.getPlanes();
        ByteBuffer buffer = planes[0].getBuffer();
        int pixelStride = planes[0].getPixelStride();
        int rowStride = planes[0].getRowStride();
        int rowPadding = rowStride - pixelStride * screenWidth;
        
        Bitmap bitmap = Bitmap.createBitmap(
            screenWidth + rowPadding / pixelStride,
            screenHeight,
            Bitmap.Config.ARGB_8888
        );
        
        bitmap.copyPixelsFromBuffer(buffer);
        
        // Crop if there's row padding
        if (rowPadding != 0) {
            Bitmap croppedBitmap = Bitmap.createBitmap(bitmap, 0, 0, screenWidth, screenHeight);
            bitmap.recycle();
            return croppedBitmap;
        }
        
        return bitmap;
    }
    
    private Handler getBackgroundHandler() {
        if (backgroundHandler == null) {
            backgroundHandler = new Handler(Looper.getMainLooper());
        }
        return backgroundHandler;
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Screen Capture Service",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Captures screen for remote control");
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }
    
    private Notification createNotification() {
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Remote Control Active")
            .setContentText("Screen sharing is active")
            .setSmallIcon(R.drawable.ic_notification)
            .setOngoing(true)
            .build();
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        
        if (virtualDisplay != null) {
            virtualDisplay.release();
        }
        
        if (imageReader != null) {
            imageReader.close();
        }
        
        if (mediaProjection != null) {
            mediaProjection.stop();
        }
        
        Log.d(TAG, "Screen capture service destroyed");
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
