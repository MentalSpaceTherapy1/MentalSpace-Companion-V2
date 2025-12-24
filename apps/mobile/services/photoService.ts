/**
 * Photo Service
 * Handles image picking, camera access, and local photo storage for mood board
 */

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';

// Get document directory with fallback
const getDocumentDirectory = (): string => {
  const dir = (FileSystem as any).documentDirectory;
  return dir || '';
};

const PHOTOS_DIR = `${getDocumentDirectory()}mood-photos/`;

/**
 * Initialize photos directory
 */
async function ensurePhotosDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

/**
 * Request camera permissions
 */
async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== 'granted') {
    if (Platform.OS === 'web') {
      window.alert('Camera permission is required to take photos.');
    } else {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to take photos.',
        [{ text: 'OK' }]
      );
    }
    return false;
  }

  return true;
}

/**
 * Request media library permissions
 */
async function requestMediaLibraryPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    if (Platform.OS === 'web') {
      window.alert('Photo library permission is required to select photos.');
    } else {
      Alert.alert(
        'Photo Library Permission Required',
        'Please enable photo library access in your device settings to select photos.',
        [{ text: 'OK' }]
      );
    }
    return false;
  }

  return true;
}

/**
 * Launch image picker from gallery
 */
export async function pickImage(): Promise<string | null> {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
}

/**
 * Launch camera to take a photo
 */
export async function takePhoto(): Promise<string | null> {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
}

/**
 * Save photo to app's local storage
 * @param uri - Source URI of the photo
 * @param id - Unique identifier for the photo (usually check-in ID)
 * @returns Path to saved photo or null on error
 */
export async function savePhotoLocally(uri: string, id: string): Promise<string | null> {
  try {
    await ensurePhotosDirectory();

    const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${id}.${fileExtension}`;
    const destinationUri = `${PHOTOS_DIR}${fileName}`;

    // Copy the image to our app's directory
    await FileSystem.copyAsync({
      from: uri,
      to: destinationUri,
    });

    return destinationUri;
  } catch (error) {
    console.error('Error saving photo locally:', error);
    return null;
  }
}

/**
 * Delete a photo from local storage
 * @param id - Unique identifier of the photo to delete
 */
export async function deletePhoto(id: string): Promise<boolean> {
  try {
    const photoPath = await getPhotoPath(id);
    if (!photoPath) return false;

    const fileInfo = await FileSystem.getInfoAsync(photoPath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(photoPath);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
}

/**
 * Get the full path to a photo by ID
 * @param id - Unique identifier of the photo
 * @returns Full URI to the photo or null if not found
 */
export async function getPhotoPath(id: string): Promise<string | null> {
  try {
    await ensurePhotosDirectory();

    // Try common image extensions
    const extensions = ['jpg', 'jpeg', 'png', 'heic'];

    for (const ext of extensions) {
      const photoPath = `${PHOTOS_DIR}${id}.${ext}`;
      const fileInfo = await FileSystem.getInfoAsync(photoPath);

      if (fileInfo.exists) {
        return photoPath;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting photo path:', error);
    return null;
  }
}

/**
 * Check if a photo exists for a given ID
 * @param id - Unique identifier of the photo
 */
export async function hasPhoto(id: string): Promise<boolean> {
  const photoPath = await getPhotoPath(id);
  return photoPath !== null;
}

/**
 * Get all stored photo IDs
 * @returns Array of photo IDs
 */
export async function getAllPhotoIds(): Promise<string[]> {
  try {
    await ensurePhotosDirectory();

    const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);

    // Extract IDs from filenames (remove extension)
    const photoIds = files.map(file => {
      const lastDotIndex = file.lastIndexOf('.');
      return lastDotIndex > 0 ? file.substring(0, lastDotIndex) : file;
    });

    return photoIds;
  } catch (error) {
    console.error('Error getting all photo IDs:', error);
    return [];
  }
}

/**
 * Get photo file size in bytes
 * @param id - Unique identifier of the photo
 */
export async function getPhotoSize(id: string): Promise<number> {
  try {
    const photoPath = await getPhotoPath(id);
    if (!photoPath) return 0;

    const fileInfo = await FileSystem.getInfoAsync(photoPath);
    return fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
  } catch (error) {
    console.error('Error getting photo size:', error);
    return 0;
  }
}

/**
 * Clear all photos (use with caution)
 */
export async function clearAllPhotos(): Promise<boolean> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);

    if (dirInfo.exists) {
      await FileSystem.deleteAsync(PHOTOS_DIR);
      await ensurePhotosDirectory();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error clearing all photos:', error);
    return false;
  }
}
