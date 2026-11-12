
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@moneyflow_notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const getAppNotifications = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('[Notifications] Ошибка загрузки:', error);
    return [];
  }
};

export const scheduleLoginNotification = async () => {
  try {
    const permission = await Notifications.getPermissionsAsync();

    let status = permission.status;

    if (status !== 'granted') {
      const result = await Notifications.requestPermissionsAsync();
      status = result.status;
    }

    if (status !== 'granted') {
      console.log('[Notifications] Нет разрешения');
      return;
    }

    const loginDate = new Date();

    const notification = {
      id: `login_${Date.now()}`,
      title: 'Вход в аккаунт',
      message: 'Вы успешно вошли в MoneyFlow.',
      date: loginDate.toISOString(),
      type: 'login',
    };

    // Сохраняем уведомление внутри приложения
    const currentNotifications = await getAppNotifications();

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([notification, ...currentNotifications])
    );

    const formattedDate = loginDate.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Планируем системное уведомление
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: `${notification.message}\nДата и время: ${formattedDate}`,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: false,
      },
    });

    console.log('[Notifications] Уведомление сохранено и запланировано');
  } catch (error) {
    console.error('[Notifications] Ошибка:', error);
  }
};


