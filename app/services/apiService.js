
const BASE_URL = 'https://dummyjson.com';

export const API_ENDPOINTS = {
  products: '/products',
};

const ALLOWED_SORT_FIELDS = ['title', 'price', 'rating'];
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];

export const getProducts = async (
  limit = 10,
  skip = 0,
  sortBy = 'title',
  order = 'asc'
) => {
  // Проверка параметров запроса
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Лимит должен быть целым числом от 1 до 100');
  }

  if (!Number.isInteger(skip) || skip < 0) {
    throw new Error('Параметр skip должен быть неотрицательным числом');
  }

  if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
    throw new Error('Недопустимое поле сортировки');
  }

  if (!ALLOWED_SORT_ORDERS.includes(order)) {
    throw new Error('Порядок сортировки должен быть asc или desc');
  }

  // Формирование query-параметров
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
    sortBy,
    order,
  });

  const url = `${BASE_URL}${API_ENDPOINTS.products}?${params}`;

  const response = await fetch(url);

  console.log('[API] HTTP status:', response.status);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  // Получение JSON
  const data = await response.json();

  // Проверка структуры ответа
  if (
    !data ||
    !Array.isArray(data.products) ||
    !Number.isInteger(data.total) ||
    !Number.isInteger(data.skip) ||
    !Number.isInteger(data.limit)
  ) {
    throw new Error('Некорректная структура ответа API');
  }

  // Проверка каждого товара
  const validProducts = data.products.every((product) => {
    return (
      product &&
      Number.isInteger(product.id) &&
      typeof product.title === 'string' &&
      product.title.trim().length > 0 &&
      typeof product.price === 'number' &&
      Number.isFinite(product.price) &&
      product.price >= 0
    );
  });

  if (!validProducts) {
    throw new Error('API вернул товары с некорректными полями');
  }

  console.log('[API] Получено записей:', data.products.length);
  console.log('[API] Сортировка:', sortBy, order);

  return data.products;
};

