const BASE_URL = 'https://dummyjson.com';

export const API_ENDPOINTS = {
  products: '/products'
};

export const getProducts = async (limit = 10, skip = 0) => {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip)
  });

  const response = await fetch(
    `${BASE_URL}${API_ENDPOINTS.products}?${params}`
  );

  console.log('[API] HTTP status:', response.status);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data.products)) {
    throw new Error('Некорректная структура ответа API');
  }

  return data.products;
};

