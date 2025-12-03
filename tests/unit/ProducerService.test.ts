import { ProducerService } from '../../src/application/services/ProducerService';
import { Movie } from '../../src/domain/entities/Movie';

describe('ProducerService', () => {
  let producerService: ProducerService;

  beforeEach(() => {
    producerService = new ProducerService();
  });

  describe('parseProducers', () => {
    it('should parse single producer', () => {
      const result = producerService.parseProducers('Producer 1');
      expect(result).toEqual(['Producer 1']);
    });

    it('should parse multiple producers separated by comma', () => {
      const result = producerService.parseProducers('Producer 1, Producer 2');
      expect(result).toEqual(['Producer 1', 'Producer 2']);
    });

    it('should parse multiple producers separated by "and"', () => {
      const result = producerService.parseProducers('Producer 1 and Producer 2');
      expect(result).toEqual(['Producer 1', 'Producer 2']);
    });

    it('should parse multiple producers with mixed separators', () => {
      const result = producerService.parseProducers('Producer 1, Producer 2 and Producer 3');
      expect(result).toEqual(['Producer 1', 'Producer 2', 'Producer 3']);
    });

    it('should trim whitespace from producer names', () => {
      const result = producerService.parseProducers('  Producer 1  ,  Producer 2  ');
      expect(result).toEqual(['Producer 1', 'Producer 2']);
    });

    it('should filter out empty strings', () => {
      const result = producerService.parseProducers('Producer 1,,Producer 2');
      expect(result).toEqual(['Producer 1', 'Producer 2']);
    });
  });

  describe('groupWinsByProducer', () => {
    it('should group wins by producer', () => {
      const movies: Movie[] = [
        { year: 1990, title: 'Movie 1', studios: 'Studio 1', producers: 'Producer A', winner: true },
        { year: 1991, title: 'Movie 2', studios: 'Studio 2', producers: 'Producer A', winner: true },
        { year: 1992, title: 'Movie 3', studios: 'Studio 3', producers: 'Producer B', winner: true },
      ];

      const result = producerService.groupWinsByProducer(movies);

      expect(result.get('Producer A')).toEqual([1990, 1991]);
      expect(result.get('Producer B')).toEqual([1992]);
    });

    it('should handle multiple producers per movie', () => {
      const movies: Movie[] = [
        { year: 1990, title: 'Movie 1', studios: 'Studio 1', producers: 'Producer A, Producer B', winner: true },
      ];

      const result = producerService.groupWinsByProducer(movies);

      expect(result.get('Producer A')).toEqual([1990]);
      expect(result.get('Producer B')).toEqual([1990]);
    });

    it('should sort years in ascending order', () => {
      const movies: Movie[] = [
        { year: 1995, title: 'Movie 1', studios: 'Studio 1', producers: 'Producer A', winner: true },
        { year: 1990, title: 'Movie 2', studios: 'Studio 2', producers: 'Producer A', winner: true },
        { year: 2000, title: 'Movie 3', studios: 'Studio 3', producers: 'Producer A', winner: true },
      ];

      const result = producerService.groupWinsByProducer(movies);

      expect(result.get('Producer A')).toEqual([1990, 1995, 2000]);
    });

    it('should handle empty movie list', () => {
      const result = producerService.groupWinsByProducer([]);
      expect(result.size).toBe(0);
    });

    it('should handle producers with "and" separator', () => {
      const movies: Movie[] = [
        { year: 1990, title: 'Movie 1', studios: 'Studio 1', producers: 'Producer A and Producer B', winner: true },
      ];

      const result = producerService.groupWinsByProducer(movies);

      expect(result.get('Producer A')).toEqual([1990]);
      expect(result.get('Producer B')).toEqual([1990]);
    });
  });
});
