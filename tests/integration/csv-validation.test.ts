import * as fs from 'fs';
import * as path from 'path';
import request from 'supertest';
import { App } from '../../src/app';
import { Database } from '../../src/infrastructure/database/Database';

describe('CSV Validation Tests', () => {
  const CSV_PATH = path.join(__dirname, '../../Movielist.csv');
  const BACKUP_PATH = path.join(__dirname, '../../Movielist.csv.backup');
  let originalContent: string;

  beforeAll(() => {
    /* backup do conteúdo original */
    originalContent = fs.readFileSync(CSV_PATH, 'utf-8');
    fs.writeFileSync(BACKUP_PATH, originalContent);
  });

  afterAll(() => {
    /* restaura o arquivo original */
    fs.writeFileSync(CSV_PATH, originalContent);
    if (fs.existsSync(BACKUP_PATH)) {
      fs.unlinkSync(BACKUP_PATH);
    }
  });

  afterEach(async () => {
    /* restaura o CSV após cada teste */
    fs.writeFileSync(CSV_PATH, originalContent);
    
    /* reset da instância do Database para permitir nova inicialização */
    try {
      await Database.getInstance().close();
    } catch (error) {
      /* aqui tanto faz */
    }
    
    /* força reset da instância singleton */
    (Database as any).instance = undefined;
  });

  describe('Data Modification Detection', () => {
    it('should fail when a winner is removed from CSV', async () => {
      /* modifica o CSV removendo um vencedor (Joel Silver - 1990) */
      const modifiedContent = originalContent.replace(
        '1990;The Adventures of Ford Fairlane;20th Century Fox;Steven Perry and Joel Silver;yes',
        '1990;The Adventures of Ford Fairlane;20th Century Fox;Steven Perry and Joel Silver;'
      );
      fs.writeFileSync(CSV_PATH, modifiedContent);

      const appInstance = new App();
      await appInstance.initDatabase();

      const res = await request(appInstance.app).get('/producers/intervals');

      expect(res.body).not.toEqual({
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
      });
    });

    it('should fail when a winner year is changed', async () => {
      /* modifica o ano de um vencedor */
      const modifiedContent = originalContent.replace(
        '1990;The Adventures of Ford Fairlane;20th Century Fox;Steven Perry and Joel Silver;yes',
        '1992;The Adventures of Ford Fairlane;20th Century Fox;Steven Perry and Joel Silver;yes'
      );
      fs.writeFileSync(CSV_PATH, modifiedContent);

      const appInstance = new App();
      await appInstance.initDatabase();

      const res = await request(appInstance.app).get('/producers/intervals');

      /* o intervalo mínimo deve ser diferente */
      const hasJoelSilverWithInterval1 = res.body.min && res.body.min.some(
        (item: any) => item.producer === 'Joel Silver' && item.interval === 1
      );
      expect(hasJoelSilverWithInterval1).toBeFalsy();
    });

    it('should fail when a new winner is added', async () => {
      /* adiciona um novo vencedor que criaria um intervalo menor */
      const newLine = '\n1989;Test Movie;Test Studio;Joel Silver;yes';
      fs.writeFileSync(CSV_PATH, originalContent + newLine);

      const appInstance = new App();
      await appInstance.initDatabase();

      const res = await request(appInstance.app).get('/producers/intervals');

      expect(res.body).not.toEqual({
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
      });
    });

    it('should fail when producer name is changed', async () => {
      const modifiedContent = originalContent.replace(
        'Matthew Vaughn',
        'Modified Producer Name'
      );
      fs.writeFileSync(CSV_PATH, modifiedContent);

      const appInstance = new App();
      await appInstance.initDatabase();

      const res = await request(appInstance.app).get('/producers/intervals');

      const hasMatthewVaughn = res.body.max && res.body.max.some(
        (item: any) => item.producer === 'Matthew Vaughn'
      );
      expect(hasMatthewVaughn).toBeFalsy();
    });

    it('should detect when CSV structure is corrupted (strict mode)', async () => {
      const corruptedContent = 'invalid;csv;structure\n' + originalContent;
      fs.writeFileSync(CSV_PATH, corruptedContent);
      const appInstance = new App();
      await expect(appInstance.initDatabase()).rejects.toThrow('CSV validation failed');
    });
  });

  describe('Error Handling - Invalid Structure', () => {
    it('should reject when CSV has only invalid lines', async () => {
      const invalidContent = 'year;title;studios;producers;winner\n2020;Test Movie;Test Studio\nINVALID;Another;Test\n';
      fs.writeFileSync(CSV_PATH, invalidContent);
      const appInstance = new App();
      await expect(appInstance.initDatabase()).rejects.toThrow('CSV validation failed');
    });

    it('should reject when CSV has invalid year format in all lines', async () => {
      const invalidContent = 'year;title;studios;producers;winner\nINVALID;Test Movie;Test Studio;Test Producer;yes\nNOT_A_YEAR;Another Movie;Studio;Producer;no\n';
      fs.writeFileSync(CSV_PATH, invalidContent);

      const appInstance = new App();
      
      /* deve lançar erro porque todas as linhas têm anos inválidos */
      await expect(appInstance.initDatabase()).rejects.toThrow('CSV validation failed');
    });

    it('should reject when CSV is empty', async () => {
      fs.writeFileSync(CSV_PATH, '');
      const appInstance = new App();
      await expect(appInstance.initDatabase()).rejects.toThrow('CSV file is empty');
    });

    it('should reject with partial valid data (strict mode)', async () => {
      const mixedContent = 'year;title;studios;producers;winner\n2020;Valid Movie;Valid Studio;Valid Producer;yes\nINVALID;Bad Movie;Bad Studio;Bad Producer;no\n2021;Another Valid;Studio;Producer;yes\n';
      fs.writeFileSync(CSV_PATH, mixedContent);
      const appInstance = new App();
      await expect(appInstance.initDatabase()).rejects.toThrow('CSV validation failed');
    });

    it('should reject when CSV has completely wrong structure', async () => {
      const wrongStructure = 'This is not a CSV file\nJust random text\n123,456,789\n';
      fs.writeFileSync(CSV_PATH, wrongStructure);
      const appInstance = new App();
      await expect(appInstance.initDatabase()).rejects.toThrow('CSV validation failed');
    });

    it('should reject when CSV has only header (no data lines)', async () => {
      const headerOnly = 'year;title;studios;producers;winner\n';
      fs.writeFileSync(CSV_PATH, headerOnly);
      const appInstance = new App();
      await expect(appInstance.initDatabase()).rejects.toThrow('CSV file has no valid data lines');
    });

    it('should reject when all lines are missing required fields', async () => {
      const missingFields = 'year;title;studios;producers;winner\n2020;;Test Studio;Test Producer;yes\n2021;Test Movie;Studio;;no\n';
      fs.writeFileSync(CSV_PATH, missingFields);
      const appInstance = new App();
      await expect(appInstance.initDatabase()).rejects.toThrow('CSV validation failed');
    });
  });
});
