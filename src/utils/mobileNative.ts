import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Check whether the app is currently running inside Capacitor on an Android or iOS device
 */
export const isNativeMobile = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Initialize native Android status bar styling and hardware listeners
 */
export const initializeNativeMobileApp = async () => {
  if (!isNativeMobile()) return;

  try {
    // Style status bar for dark header bar
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1c1917' });
  } catch (err) {
    console.warn('Native StatusBar initialization skipped:', err);
  }
};

/**
 * Trigger subtle haptic vibration on user touch interactions
 */
export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (!isNativeMobile()) return;
  try {
    await Haptics.impact({ style });
  } catch {
    // Haptics not supported or permitted on this device
  }
};

/**
 * Share or save receipt file (PDF or PNG) using native Android Share Sheet or FileSystem
 */
export const shareOrSaveReceiptFile = async ({
  blob,
  filename,
  title,
  text,
}: {
  blob: Blob;
  filename: string;
  title: string;
  text: string;
}): Promise<boolean> => {
  if (isNativeMobile()) {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          // Strip data url prefix (e.g. data:application/pdf;base64,)
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Write to device cache directory
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
      });

      // Open native Android Share sheet
      await Share.share({
        title,
        text,
        url: savedFile.uri,
        dialogTitle: `Share ${title} with...`,
      });

      return true;
    } catch (err) {
      console.warn('Native mobile share failed, falling back to download:', err);
    }
  }

  // Web fallback: Trigger standard file download
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch (err) {
    console.error('File download fallback failed:', err);
    return false;
  }
};
