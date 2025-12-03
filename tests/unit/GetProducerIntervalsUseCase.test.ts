import { GetProducerIntervalsUseCase } from '../../src/application/use-cases/GetProducerIntervalsUseCase';
import { IMovieRepository } from '../../src/domain/repositories/IMovieRepository';
import { ProducerService } from '../../src/application/services/ProducerService';
import { Movie } from '../../src/domain/entities/Movie';

describe('GetProducerIntervalsUseCase', () => {
  let useCase: GetProducerIntervalsUseCase;
  let mockRepository: jest.Mocked<IMovieRepository>;
  let producerService: ProducerService;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findWinners: jest.fn(),
    };
    producerService = new ProducerService();
    useCase = new GetProducerIntervalsUseCase(mockRepository, producerService);
  });

  it('should return min and max intervals', async () => {
    const movies: Movie[] = [
      { year: 1990, title: 'Movie 1', studios: 'Studio 1', producers: 'Producer A', winner: true },
      { year: 1991, title: 'Movie 2', studios: 'Studio 2', producers: 'Producer A', winner: true },
      { year: 2000, title: 'Movie 3', studios: 'Studio 3', producers: 'Producer B', winner: true },
      { year: 2010, title: 'Movie 4', studios: 'Studio 4', producers: 'Producer B', winner: true },
    ];

    mockRepository.findWinners.mockResolvedValue(movies);

    const result = await useCase.execute();

    expect(result.min).toHaveLength(1);
    expect(result.min[0]).toEqual({
      producer: 'Producer A',
      interval: 1,
      previousWin: 1990,
      followingWin: 1991,
    });

    expect(result.max).toHaveLength(1);
    expect(result.max[0]).toEqual({
      producer: 'Producer B',
      interval: 10,
      previousWin: 2000,
      followingWin: 2010,
    });
  });

  it('should handle multiple producers with same interval', async () => {
    const movies: Movie[] = [
      { year: 1990, title: 'Movie 1', studios: 'Studio 1', producers: 'Producer A', winner: true },
      { year: 1991, title: 'Movie 2', studios: 'Studio 2', producers: 'Producer A', winner: true },
      { year: 2000, title: 'Movie 3', studios: 'Studio 3', producers: 'Producer B', winner: true },
      { year: 2001, title: 'Movie 4', studios: 'Studio 4', producers: 'Producer B', winner: true },
    ];

    mockRepository.findWinners.mockResolvedValue(movies);

    const result = await useCase.execute();

    expect(result.min).toHaveLength(2);
    expect(result.min).toContainEqual({
      producer: 'Producer A',
      interval: 1,
      previousWin: 1990,
      followingWin: 1991,
    });
    expect(result.min).toContainEqual({
      producer: 'Producer B',
      interval: 1,
      previousWin: 2000,
      followingWin: 2001,
    });
  });

  it('should handle producer with multiple consecutive wins', async () => {
    const movies: Movie[] = [
      { year: 1990, title: 'Movie 1', studios: 'Studio 1', producers: 'Producer A', winner: true },
      { year: 1995, title: 'Movie 2', studios: 'Studio 2', producers: 'Producer A', winner: true },
      { year: 2000, title: 'Movie 3', studios: 'Studio 3', producers: 'Producer A', winner: true },
    ];

    mockRepository.findWinners.mockResolvedValue(movies);

    const result = await useCase.execute();

    expect(result.min).toHaveLength(2);
    expect(result.max).toHaveLength(2);
  });

  it('should return empty arrays when no winners', async () => {
    mockRepository.findWinners.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.min).toEqual([]);
    expect(result.max).toEqual([]);
  });

  it('should return empty arrays when producers have only one win', async () => {
    const movies: Movie[] = [
      { year: 1990, title: 'Movie 1', studios: 'Studio 1', producers: 'Producer A', winner: true },
      { year: 1991, title: 'Movie 2', studios: 'Studio 2', producers: 'Producer B', winner: true },
    ];

    mockRepository.findWinners.mockResolvedValue(movies);

    const result = await useCase.execute();

    expect(result.min).toEqual([]);
    expect(result.max).toEqual([]);
  });

  it('should handle multiple producers per movie', async () => {
    const movies: Movie[] = [
      { year: 1990, title: 'Movie 1', studios: 'Studio 1', producers: 'Producer A, Producer B', winner: true },
      { year: 1991, title: 'Movie 2', studios: 'Studio 2', producers: 'Producer A', winner: true },
      { year: 2000, title: 'Movie 3', studios: 'Studio 3', producers: 'Producer B', winner: true },
    ];

    mockRepository.findWinners.mockResolvedValue(movies);

    const result = await useCase.execute();

    expect(result.min).toHaveLength(1);
    expect(result.min[0].producer).toBe('Producer A');
    expect(result.min[0].interval).toBe(1);

    expect(result.max).toHaveLength(1);
    expect(result.max[0].producer).toBe('Producer B');
    expect(result.max[0].interval).toBe(10);
  });

  it('should call repository findWinners method', async () => {
    mockRepository.findWinners.mockResolvedValue([]);

    await useCase.execute();

    expect(mockRepository.findWinners).toHaveBeenCalledTimes(1);
  });
});
