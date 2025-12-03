import { MovieRepository } from '../../src/infrastructure/repositories/MovieRepository';
import { Database } from '../../src/infrastructure/database/Database';
import { Movie } from '../../src/domain/entities/Movie';

describe('MovieRepository', () => {
  let repository: MovieRepository;

  beforeAll(async () => {
    await Database.getInstance().waitForInit();
  });

  beforeEach(async () => {
    repository = new MovieRepository();
    
    /* Limpa db para cada teste */
    const db = Database.getInstance().getConnection();
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM movies', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  afterAll(async () => {
    await Database.getInstance().close();
  });

  describe('save', () => {
    it('should save a movie', async () => {
      const movie: Movie = {
        year: 1990,
        title: 'Test Movie',
        studios: 'Test Studio',
        producers: 'Test Producer',
        winner: true,
      };

      await expect(repository.save(movie)).resolves.not.toThrow();
    });

    it('should save multiple movies', async () => {
      const movies: Movie[] = [
        { year: 1990, title: 'Movie 1', studios: 'Studio 1', producers: 'Producer 1', winner: true },
        { year: 1991, title: 'Movie 2', studios: 'Studio 2', producers: 'Producer 2', winner: false },
      ];

      for (const movie of movies) {
        await repository.save(movie);
      }

      const winners = await repository.findWinners();
      expect(winners).toHaveLength(1);
    });
  });

  describe('findWinners', () => {
    it('should return only winners', async () => {
      const movies: Movie[] = [
        { year: 1990, title: 'Winner 1', studios: 'Studio 1', producers: 'Producer 1', winner: true },
        { year: 1991, title: 'Not Winner', studios: 'Studio 2', producers: 'Producer 2', winner: false },
        { year: 1992, title: 'Winner 2', studios: 'Studio 3', producers: 'Producer 3', winner: true },
      ];

      for (const movie of movies) {
        await repository.save(movie);
      }

      const winners = await repository.findWinners();

      expect(winners).toHaveLength(2);
      expect(winners.every(m => m.winner)).toBe(true);
      expect(winners.map(m => m.title)).toContain('Winner 1');
      expect(winners.map(m => m.title)).toContain('Winner 2');
    });

    it('should return empty array when no winners', async () => {
      const movie: Movie = {
        year: 1990,
        title: 'Not Winner',
        studios: 'Studio 1',
        producers: 'Producer 1',
        winner: false,
      };

      await repository.save(movie);

      const winners = await repository.findWinners();

      expect(winners).toHaveLength(0);
    });

    it('should return empty array when database is empty', async () => {
      const winners = await repository.findWinners();
      expect(winners).toHaveLength(0);
    });

    it('should preserve all movie properties', async () => {
      const movie: Movie = {
        year: 1990,
        title: 'Test Movie',
        studios: 'Test Studio',
        producers: 'Test Producer',
        winner: true,
      };

      await repository.save(movie);
      const winners = await repository.findWinners();

      expect(winners[0]).toMatchObject({
        year: 1990,
        title: 'Test Movie',
        studios: 'Test Studio',
        producers: 'Test Producer',
        winner: true,
      });
      expect(winners[0]).toHaveProperty('id');
    });
  });
});
