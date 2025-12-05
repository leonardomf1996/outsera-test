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

    for (const movie of movies) {
      const producers = this.parseProducers(movie.producers);
      
      for (const producer of producers) {
        if (!producerWins.has(producer)) producerWins.set(producer, []);
        
        const years = producerWins.get(producer)!;
        
        const insertIndex = this.findInsertIndex(years, movie.year);
        years.splice(insertIndex, 0, movie.year);
      }
    }

    return producerWins;
  }

  // Busca binária para inserir o ano na posição ordenada
  private findInsertIndex(sortedArray: number[], value: number): number {
    let left = 0;
    let right = sortedArray.length;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (sortedArray[mid] < value) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    return left;
  }
}
