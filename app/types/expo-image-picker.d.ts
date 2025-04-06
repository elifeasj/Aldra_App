declare module 'expo-image-picker' {
  export interface ImagePickerResult {
    canceled: boolean;
    assets: Array<{
      uri: string;
      width: number;
      height: number;
      type?: 'image' | 'video';
      fileName?: string;
      fileSize?: number;
    }>;
  }

  export enum MediaTypeOptions {
    All = 'All',
    Videos = 'Videos',
    Images = 'Images',
  }

  export function launchImageLibraryAsync(options: {
    mediaTypes: MediaTypeOptions;
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }): Promise<ImagePickerResult>;

  export function requestMediaLibraryPermissionsAsync(): Promise<{
    status: 'granted' | 'denied';
    expires: 'never';
    canAskAgain: boolean;
  }>;
}
