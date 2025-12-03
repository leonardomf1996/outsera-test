import { ProducerController } from '../../src/http/controllers/ProducerController';
import { GetProducerIntervalsUseCase } from '../../src/application/use-cases/GetProducerIntervalsUseCase';
import { Request, Response } from 'express';

describe('ProducerController', () => {
  let controller: ProducerController;
  let mockUseCase: jest.Mocked<GetProducerIntervalsUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockUseCase = {
      execute: jest.fn(),
    } as any;

    mockRequest = {};

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    controller = new ProducerController(mockUseCase);
  });

  it('should return intervals on success', async () => {
    const mockResult = {
      min: [
        {
          producer: 'Producer A',
          interval: 1,
          previousWin: 1990,
          followingWin: 1991,
        },
      ],
      max: [
        {
          producer: 'Producer B',
          interval: 10,
          previousWin: 2000,
          followingWin: 2010,
        },
      ],
    };

    mockUseCase.execute.mockResolvedValue(mockResult);

    await controller.getIntervals(mockRequest as Request, mockResponse as Response);

    expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
  });

  it('should return 500 on error', async () => {
    const error = new Error('Database error');
    mockUseCase.execute.mockRejectedValue(error);

    await controller.getIntervals(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('should handle empty results', async () => {
    const mockResult = {
      min: [],
      max: [],
    };

    mockUseCase.execute.mockResolvedValue(mockResult);

    await controller.getIntervals(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
  });
});
