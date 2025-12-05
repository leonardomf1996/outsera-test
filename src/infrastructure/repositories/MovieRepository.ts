import { IMovieRepository } from '../../domain/repositories/IMovieRepository';
import { Movie } from '../../domain/entities/Movie';
import { Database } from '../database/Database';

export class MovieRepository implements IMovieRepository {
  private db = Database.getInstance().getConnection();

  async save(movie: Movie): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO movies (year, title, studios, producers, winner) VALUES (?, ?, ?, ?, ?)';
      const winner = movie.winner ? 1 : 0;
      
      this.db.run(query, [movie.year, movie.title, movie.studios, movie.producers, winner], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async findWinners(): Promise<Movie[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM movies WHERE winner = 1';
      
      this.db.all(query, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const movies: Movie[] = rows.map(row => ({
            id: row.id,
            year: row.year,
            title: row.title,
            studios: row.studios,
            producers: row.producers,
            winner: row.winner === 1
          }));
          resolve(movies);
        }
      });
    });
  }
}
