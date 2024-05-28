/* eslint-disable */

import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';

  const baseUrl = `http://${host}:${port}`;

  process.env.BASE_URL = baseUrl;

  axios.defaults.baseURL = baseUrl;
};
