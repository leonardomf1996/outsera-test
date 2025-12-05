import { IMovieRepository } from '../../domain/repositories/IMovieRepository';
import { ProducerInterval, ProducerIntervalResponse } from '../../domain/entities/ProducerInterval';
import { ProducerService } from '../services/ProducerService';

export class GetProducerIntervalsUseCase {
  constructor(
    private movieRepository: IMovieRepository,
    private producerService: ProducerService
  ) {}

  async execute(): Promise<ProducerIntervalResponse> {
    const winners = await this.movieRepository.findWinners();
    const producerWins = this.producerService.groupWinsByProducer(winners);
    
    if (producerWins.size === 0) return { min: [], max: [] };

    let minInterval = Infinity;
    let maxInterval = -Infinity;
    const minIntervals: ProducerInterval[] = [];
    const maxIntervals: ProducerInterval[] = [];

    for (const [producer, wins] of producerWins) {
      if (wins.length < 2) continue;

      for (let i = 0; i < wins.length - 1; i++) {
        const interval = wins[i + 1] - wins[i];
        const producerInterval: ProducerInterval = {
          producer,
          interval,
          previousWin: wins[i],
          followingWin: wins[i + 1]
        };

        if (interval < minInterval) {
          minInterval = interval;
          minIntervals.length = 0;
          minIntervals.push(producerInterval);
        } else if (interval === minInterval) {
          minIntervals.push(producerInterval);
        }

        if (interval > maxInterval) {
          maxInterval = interval;
          maxIntervals.length = 0;
          maxIntervals.push(producerInterval);
        } else if (interval === maxInterval) {
          maxIntervals.push(producerInterval);
        }
      }
    }

    return {
      min: minIntervals,
      max: maxIntervals
    };
  }
}
