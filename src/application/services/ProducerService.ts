import { Movie } from '../../domain/entities/Movie';

export class ProducerService {
  parseProducers(producersString: string): string[] {
    return producersString
      .replace(/ and /g, ',')
      .split(',')
      .map(p => p.trim())
      .filter(p => p !== '');
  }

  groupWinsByProducer(movies: Movie[]): Map<string, number[]> {
    const producerWins = new Map<string, number[]>();

    movies.forEach(movie => {
      const producers = this.parseProducers(movie.producers);
      
      producers.forEach(producer => {
        if (!producerWins.has(producer)) {
          producerWins.set(producer, []);
        }
        producerWins.get(producer)!.push(movie.year);
      });
    });

    /* Ordena os anos vitoriosos para cada produtor */
    producerWins.forEach((years, producer) => {
      producerWins.set(producer, years.sort((a, b) => a - b));
    });

    return producerWins;
  }
}
