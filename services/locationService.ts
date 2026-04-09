import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

export const BG_TASK = 'WE_BG_LOCATION';

TaskManager.defineTask(BG_TASK, ({ data, error }: any) => {
  if (error) return;
  if (data?.locations?.length) {
    const loc = data.locations[data.locations.length - 1];
    const { useGameStore } = require('@/hooks/useGameStore');
    useGameStore.getState().updateLocation(loc.coords);
  }
});

export const requestPermissions = async (): Promise<{ background: boolean }> => {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') {
    throw new Error('Permissão de localização negada. O app precisa dela para funcionar.');
  }
  const bg = await Location.requestBackgroundPermissionsAsync();
  return { background: bg.status === 'granted' };
};

export const startTracking = async (): Promise<Location.LocationSubscription> => {
  const { background } = await requestPermissions();

  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 2000,
      distanceInterval: 5,
    },
    (loc) => {
      const { useGameStore } = require('@/hooks/useGameStore');
      useGameStore.getState().updateLocation(loc.coords);
    }
  );

  if (background) {
    const running = await Location.hasStartedLocationUpdatesAsync(BG_TASK).catch(() => false);
    if (!running) {
      await Location.startLocationUpdatesAsync(BG_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 8000,
        distanceInterval: 15,
        foregroundService: {
          notificationTitle: '🌍 World Explorer',
          notificationBody: 'Explorando em segundo plano...',
          notificationColor: '#00ff96',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });
    }
  }

  return subscription;
};

export const stopTracking = async (sub: Location.LocationSubscription | null) => {
  sub?.remove();
  const running = await Location.hasStartedLocationUpdatesAsync(BG_TASK).catch(() => false);
  if (running) await Location.stopLocationUpdatesAsync(BG_TASK);
};

export const getCurrentPosition = () =>
  Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

