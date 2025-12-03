import * as fs from 'fs';
import * as path from 'path';
import { IMovieRepository } from '../../domain/repositories/IMovieRepository';
import { Movie } from '../../domain/entities/Movie';

export class ImportMoviesUseCase {
  constructor(private movieRepository: IMovieRepository) {}

  async execute(csvPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(csvPath, 'utf8', async (err, data) => {
        if (err) return reject(err);

        const lines = data.split('\n');
        
        /* Remove cabeçalho */
        lines.shift(); 

        try {
          for (const line of lines) {
            if (!line.trim()) continue;

            const columns = line.split(';');
            if (columns.length >= 4) {
              const movie: Movie = {
                year: parseInt(columns[0], 10),
                title: columns[1],
                studios: columns[2],
                producers: columns[3],
                winner: columns[4] ? columns[4].trim() === 'yes' : false
              };

              await this.movieRepository.save(movie);
            }
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
