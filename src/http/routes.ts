import { Router } from 'express';
import { ProducerController } from './controllers/ProducerController';
import { MovieRepository } from '../infrastructure/repositories/MovieRepository';
import { ProducerService } from '../application/services/ProducerService';
import { GetProducerIntervalsUseCase } from '../application/use-cases/GetProducerIntervalsUseCase';

const router = Router();

const movieRepository = new MovieRepository();
const producerService = new ProducerService();
const getProducerIntervalsUseCase = new GetProducerIntervalsUseCase(movieRepository, producerService);
const producerController = new ProducerController(getProducerIntervalsUseCase);

router.get('/producers/intervals', (req, res) => producerController.getIntervals(req, res));

export default router;
