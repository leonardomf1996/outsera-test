import { Request, Response } from 'express';
import { GetProducerIntervalsUseCase } from '../../application/use-cases/GetProducerIntervalsUseCase';

/**
 * @swagger
 * /producers/intervals:
 *   get:
 *     summary: Obter intervalos de prêmios dos produtores
 *     description: Retorna o produtor com maior intervalo entre dois prêmios consecutivos e o que obteve dois prêmios mais rápido
 *     tags: [Producers]
 *     responses:
 *       200:
 *         description: Intervalos calculados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProducerIntervalResponse'
 *             examples:
 *               success:
 *                 summary: Exemplo de resposta bem-sucedida
 *                 value:
 *                   min:
 *                     - producer: Joel Silver
 *                       interval: 1
 *                       previousWin: 1990
 *                       followingWin: 1991
 *                   max:
 *                     - producer: Matthew Vaughn
 *                       interval: 13
 *                       previousWin: 2002
 *                       followingWin: 2015
 *               empty:
 *                 summary: Sem produtores com múltiplos prêmios
 *                 value:
 *                   min: []
 *                   max: []
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
export class ProducerController {
  constructor(private getProducerIntervalsUseCase: GetProducerIntervalsUseCase) {}

  async getIntervals(_request: Request, response: Response): Promise<void> {
    try {
      const result = await this.getProducerIntervalsUseCase.execute();
      response.json(result);
    } catch (error) {
      response.status(500).json({ error: 'Internal server error' });
    }
  }
}
