
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
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Invalid limit');
  }

  if (!Number.isInteger(skip) || skip < 0) {
    throw new Error('Invalid skip');
  }

  if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
    throw new Error('Invalid sort field');
  }

  if (!ALLOWED_SORT_ORDERS.includes(order)) {
    throw new Error('Invalid sort order');
  }

  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
    sortBy,
    order,
  });

  const url = `${BASE_URL}${API_ENDPOINTS.products}?${params}`;

  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error('NETWORK_ERROR');
  }

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error('INVALID_RESPONSE');
  }

  if (
    !data ||
    !Array.isArray(data.products) ||
    !Number.isInteger(data.total) ||
    !Number.isInteger(data.skip) ||
    !Number.isInteger(data.limit)
  ) {
    throw new Error('INVALID_DATA');
  }

  const validProducts = data.products.every((product) =>
    product &&
    Number.isInteger(product.id) &&
    typeof product.title === 'string' &&
    product.title.trim().length > 0 &&
    typeof product.price === 'number' &&
    Number.isFinite(product.price) &&
    product.price >= 0
  );

  if (!validProducts) {
    throw new Error('INVALID_PRODUCTS');
  }

  return data.products;
};

