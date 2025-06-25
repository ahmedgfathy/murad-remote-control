package com.remotecontrol.guest.utils;

import android.graphics.Bitmap;

import java.io.ByteArrayOutputStream;

public class ImageEncoder {
    
    public static byte[] encodeBitmap(Bitmap bitmap, int quality) {
        if (bitmap == null || bitmap.isRecycled()) {
            return null;
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        try {
            // Compress bitmap to JPEG
            bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            try {
                outputStream.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
    
    public static byte[] encodeBitmapWithResize(Bitmap bitmap, int maxWidth, int maxHeight, int quality) {
        if (bitmap == null || bitmap.isRecycled()) {
            return null;
        }
        
        // Calculate scale factor
        float scaleX = (float) maxWidth / bitmap.getWidth();
        float scaleY = (float) maxHeight / bitmap.getHeight();
        float scale = Math.min(scaleX, scaleY);
        
        if (scale < 1.0f) {
            // Resize bitmap
            int newWidth = Math.round(bitmap.getWidth() * scale);
            int newHeight = Math.round(bitmap.getHeight() * scale);
            
            Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true);
            byte[] result = encodeBitmap(resizedBitmap, quality);
            
            if (resizedBitmap != bitmap) {
                resizedBitmap.recycle();
            }
            
            return result;
        } else {
            return encodeBitmap(bitmap, quality);
        }
    }
}
