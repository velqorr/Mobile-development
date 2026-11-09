const merchants = [
  ['Пятёрочка', 'Продукты', 'food'],
  ['Перекрёсток', 'Продукты', 'food'],
  ['Метро', 'Транспорт', 'transport'],
  ['Яндекс Go', 'Транспорт', 'transport'],
  ['Кофейня', 'Кафе', 'cafe'],
  ['Ozon', 'Покупки', 'shopping'],
  ['Wildberries', 'Покупки', 'shopping'],
  ['Кинотеатр', 'Развлечения', 'fun'],
  ['Аптека', 'Здоровье', 'health'],
  ['Зарплата', 'Зарплата', 'salary'],
  ['Фриланс', 'Подработка', 'work'],
  ['Мобильный оператор', 'Связь', 'communication']
];

const descriptions = [
  'Покупка продуктов', 'Оплата поездки', 'Обед', 'Заказ товаров',
  'Покупка бытовых мелочей', 'Оплата подписки', 'Пополнение счёта',
  'Поступление зарплаты', 'Оплата проекта', 'Покупка лекарств',
  'Билеты и развлечения', 'Покупка кофе', 'Оплата услуг'
];

const coordinates = [
  { latitude: 55.7558, longitude: 37.6173 },
  { latitude: 55.7512, longitude: 37.6184 },
  { latitude: 55.7601, longitude: 37.6231 }
];

export const mockTransactions = Array.from({ length: 35 }, (_, index) => {
  const source = merchants[index % merchants.length];
  const type = index % 5 === 0 ? 'income' : 'expense';
  const day = String((index % 27) + 1).padStart(2, '0');
  const hour = String(9 + (index % 11)).padStart(2, '0');
  const minute = String((index * 7) % 60).padStart(2, '0');
  const date = `2026-10-${day}`;
  const amount = type === 'income'
    ? [12000, 18500, 25000, 32000, 45000][index % 5]
    : [180, 350, 490, 750, 1250, 2100, 3400][index % 7];

  return {
    id: `mock_${String(index + 1).padStart(3, '0')}`,
    type,
    amount,
    currency: 'RUB',
    desc: type === 'income' ? descriptions[7 + (index % 2)] : descriptions[index % descriptions.length],
    time: `${hour}:${minute}`,
    date,
    category: {
      id: type === 'income' ? (index % 2 ? 'salary' : 'work') : source[2],
      name: type === 'income' ? source[1] : source[1],
      icon: type === 'income' ? 'wallet' : 'card'
    },
    merchant: {
      name: source[0],
      address: 'Москва',
      coordinates: {
        latitude: 55.7558 + (index % 8) * 0.001,
        longitude: 37.6173 + (index % 6) * 0.001
      }
    },
    paymentMethod: {
      type: 'card',
      name: 'Основная карта'
    },
    status: 'completed',
    statusHistory: [
      { status: 'pending', date: `${date}T${hour}:${minute}:00` },
      { status: 'completed', date: `${date}T${hour}:${minute}:30` }
    ],
    priority: index % 9 === 0 ? 'high' : 'normal',
    receipt: {
      image: null,
      description: `Чек: ${source[0]}`
    }
  };
});
