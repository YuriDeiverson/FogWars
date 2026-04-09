import 'dotenv/config';

import type { ExpoConfig } from 'expo/config';

type ConfigContext = { config: ExpoConfig };

export default ({ config }: ConfigContext): ExpoConfig => {
  const key =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_ANDROID_API_KEY ||
    process.env.GOOGLE_MAPS_IOS_API_KEY;

  const iosConfig = key
    ? {
        ...(config.ios ?? {}),
        config: {
          ...((config.ios as any)?.config ?? {}),
          googleMapsApiKey: key,
        },
      }
    : config.ios;

  const androidConfig = key
    ? {
        ...(config.android ?? {}),
        config: {
          ...((config.android as any)?.config ?? {}),
          googleMaps: {
            ...((config.android as any)?.config?.googleMaps ?? {}),
            apiKey: key,
          },
        },
      }
    : config.android;

  return {
    ...config,
    ios: iosConfig,
    android: androidConfig,
  };
};

