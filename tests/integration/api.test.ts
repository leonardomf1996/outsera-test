import request from 'supertest';
import { App } from '../../src/app';
import { Database } from '../../src/infrastructure/database/Database';

let appInstance: App;

beforeAll(async () => {
  appInstance = new App();
  await appInstance.initDatabase();
});

afterAll(async () => {
  await Database.getInstance().close();
});

describe('GET /producers/intervals', () => {
  it('should return producers with min and max intervals', async () => {
    const res = await request(appInstance.app).get('/producers/intervals');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('min');
    expect(res.body).toHaveProperty('max');

    expect(Array.isArray(res.body.min)).toBeTruthy();
    expect(Array.isArray(res.body.max)).toBeTruthy();

    if (res.body.min.length > 0) {
      const minItem = res.body.min[0];
      expect(minItem).toHaveProperty('producer');
      expect(minItem).toHaveProperty('interval');
      expect(minItem).toHaveProperty('previousWin');
      expect(minItem).toHaveProperty('followingWin');
    }

    if (res.body.max.length > 0) {
      const maxItem = res.body.max[0];
      expect(maxItem).toHaveProperty('producer');
      expect(maxItem).toHaveProperty('interval');
      expect(maxItem).toHaveProperty('previousWin');
      expect(maxItem).toHaveProperty('followingWin');
    }

    console.log('API Response:', JSON.stringify(res.body, null, 2));
  });
});
