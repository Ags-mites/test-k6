export const testData = {
  searchTerms: [
    'top',
    'dress',
    'shirt',
    'pants',
    'shoe',
  ],
  invalidSearchTerms: [
    '',
    '!@#$%',
    '12345',
  ],
  endpoints: {
    productsList: {
      path: '/productsList',
      method: 'GET',
      p95Threshold: 1500,
      p99Threshold: 2000,
    },
    searchProduct: {
      path: '/searchProduct',
      method: 'POST',
      payloadKey: 'search_product',
      p95Threshold: 1000,
      p99Threshold: 1500,
    },
  },
};
