import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '60s', target: 20 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    'http_req_duration{endpoint:productsList}': ['p(95)<1500'],
    'http_req_duration{endpoint:searchProduct}': ['p(95)<1000'],
    'http_req_duration{endpoint:productsList}': ['p(99)<2000'],
    'http_req_duration{endpoint:searchProduct}': ['p(99)<1500'],
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE_URL = 'https://automationexercise.com/api';
const TIMEOUT = '5s';

const successRate = new Rate('success_rate');
const productsListDuration = new Trend('productsList_duration');
const searchProductDuration = new Trend('searchProduct_duration');

const searchTerms = ['top', 'dress', 'shirt', 'pants', 'shoe'];

export default function () {
  const productsListParams = {
    timeout: TIMEOUT,
    tags: { endpoint: 'productsList' },
  };

  const resProductsList = http.get(BASE_URL + '/productsList', productsListParams);

  check(resProductsList, {
    'productsList - status is 200': (r) => r.status === 200,
    'productsList - response time < 5s': (r) => r.timings.duration < 5000,
    'productsList - has valid json': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    'productsList - has products key': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('products');
      } catch (e) {
        return false;
      }
    },
  });

  successRate.add(resProductsList.status === 200);
  productsListDuration.add(resProductsList.timings.duration);

  sleep(1);

  const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const searchPayload = { search_product: searchTerm };

  const searchParams = {
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    tags: { endpoint: 'searchProduct' },
  };

  const resSearch = http.post(
    BASE_URL + '/searchProduct',
    searchPayload,
    searchParams
  );

  check(resSearch, {
    'searchProduct - status is 200': (r) => r.status === 200,
    'searchProduct - response time < 5s': (r) => r.timings.duration < 5000,
    'searchProduct - has valid json': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    'searchProduct - has products key': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('products');
      } catch (e) {
        return false;
      }
    },
  });

  successRate.add(resSearch.status === 200);
  searchProductDuration.add(resSearch.timings.duration);

  sleep(1);
}
