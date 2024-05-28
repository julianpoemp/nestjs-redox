import axios from 'axios';
import puppeteer, { type Browser } from 'puppeteer';

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});

describe('GET /api/reference', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      defaultViewport: { width: 1920, height: 1080 },
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should work with theme', async () => {
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      Authorization: `Basic ${Buffer.from('test:test').toString('base64')}`,
    });

    const res = await page.goto(`${process.env.BASE_URL}/api/reference`, {
      waitUntil: 'networkidle0',
    });

    expect(res.status()).toBe(200);

    const sidebar = await page.$('#redoc-container > div > div.menu-content');
    const width = await sidebar.evaluate(
      (el) => el.getBoundingClientRect().width
    );

    expect(width).toBe(222);
  });
});
