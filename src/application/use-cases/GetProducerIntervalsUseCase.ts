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
    
    const intervals: ProducerInterval[] = [];

    producerWins.forEach((wins, producer) => {
      if (wins.length >= 2) {
        for (let i = 0; i < wins.length - 1; i++) {
          intervals.push({
            producer,
            interval: wins[i + 1] - wins[i],
            previousWin: wins[i],
            followingWin: wins[i + 1]
          });
        }
      }
    });

    if (intervals.length === 0) {
      return { min: [], max: [] };
    }

    const minInterval = Math.min(...intervals.map(i => i.interval));
    const maxInterval = Math.max(...intervals.map(i => i.interval));

    return {
      min: intervals.filter(i => i.interval === minInterval),
      max: intervals.filter(i => i.interval === maxInterval)
    };
  }
}
