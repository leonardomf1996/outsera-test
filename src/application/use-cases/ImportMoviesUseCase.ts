import * as fs from 'fs';
import { IMovieRepository } from '../../domain/repositories/IMovieRepository';
import { Movie } from '../../domain/entities/Movie';

export class ImportMoviesUseCase {
  constructor(private movieRepository: IMovieRepository) {}

  async execute(csvPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(csvPath, 'utf8', async (err, data) => {
        if (err) return reject(err);

        if (!data || !data.trim()) return reject(new Error('CSV file is empty'));

        const lines = data.split('\n');
        
        if (lines.length === 0) return reject(new Error('CSV file is empty'));
        
        /* Valida cabeçalho */
        const header = lines[0];
        const expectedHeader = 'year;title;studios;producers;winner';
        
        if (!header || !header.includes('year') || !header.includes('title')) console.warn(`Warning: CSV header may be invalid. Expected format: ${expectedHeader}`);
        
        /* Remove cabeçalho */
        lines.shift(); 

        let validLines = 0;
        let invalidLines = 0;
        const errors: string[] = [];
        const moviesToSave: Movie[] = [];

        try {
          /* processa tudo, depois salva em lote */
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 2;
            
            if (!line || line.length === 0) continue;
            
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0) continue;

            const columns = trimmedLine.split(';', 5);
            
            if (columns.length < 4) {
              invalidLines++;
              const errorMsg = `Line ${lineNumber}: Invalid structure - expected at least 4 columns, found ${columns.length}`;
              errors.push(errorMsg);
              console.warn(errorMsg);
              continue;
            }

            const yearStr = columns[0];
            const title = columns[1];
            const producers = columns[3];

            if (!title || title.length === 0) {
              invalidLines++;
              const errorMsg = `Line ${lineNumber}: Missing required field "title"`;
              errors.push(errorMsg);
              console.warn(errorMsg);
              continue;
            }

            if (!producers || producers.length === 0) {
              invalidLines++;
              const errorMsg = `Line ${lineNumber}: Missing required field "producers"`;
              errors.push(errorMsg);
              console.warn(errorMsg);
              continue;
            }

            const year = parseInt(yearStr, 10);
            
            if (isNaN(year)) {
              invalidLines++;
              const errorMsg = `Line ${lineNumber}: Invalid year format - "${yearStr}" is not a valid number`;
              errors.push(errorMsg);
              console.warn(errorMsg);
              continue;
            }

            const movie: Movie = {
              year,
              title,
              studios: columns[2] || '',
              producers,
              winner: columns[4] === 'yes'
            };

            moviesToSave.push(movie);
            validLines++;
          }
          
          /* salvando em lotes */
          await Promise.all(moviesToSave.map(movie => this.movieRepository.save(movie)));
          
          if (invalidLines > 0) return reject(new Error(`CSV validation failed: ${invalidLines} invalid line(s) found. All lines must be valid for the application to start.`));
          
          if (validLines === 0) return reject(new Error('CSV file has no valid data lines.'));
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
