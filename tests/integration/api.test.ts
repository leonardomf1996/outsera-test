import request from 'supertest';
import { App } from '../../src/app';
import { Database } from '../../src/infrastructure/database/Database';
import { ProducerIntervalResponse } from '../../src/domain/entities/ProducerInterval';

let appInstance: App;

beforeAll(async () => {
  appInstance = new App();
  await appInstance.initDatabase();
});

afterAll(async () => {
  await Database.getInstance().close();
});

describe('GET /producers/intervals', () => {
  const EXPECTED_RESULT: ProducerIntervalResponse = {
    min: [
      {
        producer: 'Joel Silver',
        interval: 1,
        previousWin: 1990,
        followingWin: 1991
      }
    ],
    max: [
      {
        producer: 'Matthew Vaughn',
        interval: 13,
        previousWin: 2002,
        followingWin: 2015
      }
    ]
  };

  it('should return producers with min and max intervals matching the CSV data', async () => {
    const res = await request(appInstance.app).get('/producers/intervals');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('min');
    expect(res.body).toHaveProperty('max');

    expect(Array.isArray(res.body.min)).toBeTruthy();
    expect(Array.isArray(res.body.max)).toBeTruthy();

    expect(res.body.min).toHaveLength(EXPECTED_RESULT.min.length);
    expect(res.body.min).toEqual(
      expect.arrayContaining(
        EXPECTED_RESULT.min.map(item =>
          expect.objectContaining({
            producer: item.producer,
            interval: item.interval,
            previousWin: item.previousWin,
            followingWin: item.followingWin
          })
        )
      )
    );

    expect(res.body.max).toHaveLength(EXPECTED_RESULT.max.length);
    expect(res.body.max).toEqual(
      expect.arrayContaining(
        EXPECTED_RESULT.max.map(item =>
          expect.objectContaining({
            producer: item.producer,
            interval: item.interval,
            previousWin: item.previousWin,
            followingWin: item.followingWin
          })
        )
      )
    );

    console.log('API Response:', JSON.stringify(res.body, null, 2));
  });

  it('should have all required properties for each interval', async () => {
    const res = await request(appInstance.app).get('/producers/intervals');

    expect(res.statusCode).toEqual(200);

    if (res.body.min.length > 0) {
      const minItem = res.body.min[0];
      expect(minItem).toHaveProperty('producer');
      expect(minItem).toHaveProperty('interval');
      expect(minItem).toHaveProperty('previousWin');
      expect(minItem).toHaveProperty('followingWin');
      
      expect(typeof minItem.producer).toBe('string');
      expect(typeof minItem.interval).toBe('number');
      expect(typeof minItem.previousWin).toBe('number');
      expect(typeof minItem.followingWin).toBe('number');
    }

    if (res.body.max.length > 0) {
      const maxItem = res.body.max[0];
      expect(maxItem).toHaveProperty('producer');
      expect(maxItem).toHaveProperty('interval');
      expect(maxItem).toHaveProperty('previousWin');
      expect(maxItem).toHaveProperty('followingWin');
      
      expect(typeof maxItem.producer).toBe('string');
      expect(typeof maxItem.interval).toBe('number');
      expect(typeof maxItem.previousWin).toBe('number');
      expect(typeof maxItem.followingWin).toBe('number');
    }
  });

  it('should fail if CSV data is modified and results change', async () => {
    const res = await request(appInstance.app).get('/producers/intervals');

    expect(res.statusCode).toEqual(200);

    const actualResult = res.body as ProducerIntervalResponse;

    expect(actualResult).toEqual(EXPECTED_RESULT);
  });

  it('should maintain data integrity - intervals should be positive', async () => {
    const res = await request(appInstance.app).get('/producers/intervals');

    expect(res.statusCode).toEqual(200);

    res.body.min.forEach((item: any) => {
      expect(item.interval).toBeGreaterThan(0);
      expect(item.followingWin).toBeGreaterThan(item.previousWin);
      expect(item.followingWin - item.previousWin).toBe(item.interval);
    });

    res.body.max.forEach((item: any) => {
      expect(item.interval).toBeGreaterThan(0);
      expect(item.followingWin).toBeGreaterThan(item.previousWin);
      expect(item.followingWin - item.previousWin).toBe(item.interval);
    });
  });

  it('should have min interval less than or equal to max interval', async () => {
    const res = await request(appInstance.app).get('/producers/intervals');

    expect(res.statusCode).toEqual(200);

    if (res.body.min.length > 0 && res.body.max.length > 0) {
      const minInterval = res.body.min[0].interval;
      const maxInterval = res.body.max[0].interval;
      
      expect(minInterval).toBeLessThanOrEqual(maxInterval);
    }
  });
});
