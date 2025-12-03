/**
 * @swagger
 * components:
 *   schemas:
 *     ProducerInterval:
 *       type: object
 *       required:
 *         - producer
 *         - interval
 *         - previousWin
 *         - followingWin
 *       properties:
 *         producer:
 *           type: string
 *           description: Nome do produtor
 *           example: Joel Silver
 *         interval:
 *           type: integer
 *           description: Intervalo em anos entre dois prêmios consecutivos
 *           minimum: 1
 *           example: 1
 *         previousWin:
 *           type: integer
 *           description: Ano do prêmio anterior
 *           minimum: 1900
 *           example: 1990
 *         followingWin:
 *           type: integer
 *           description: Ano do prêmio seguinte
 *           minimum: 1900
 *           example: 1991
 *       example:
 *         producer: Joel Silver
 *         interval: 1
 *         previousWin: 1990
 *         followingWin: 1991
 *
 *     ProducerIntervalResponse:
 *       type: object
 *       required:
 *         - min
 *         - max
 *       properties:
 *         min:
 *           type: array
 *           description: Lista de produtores com o menor intervalo entre prêmios
 *           items:
 *             $ref: '#/components/schemas/ProducerInterval'
 *         max:
 *           type: array
 *           description: Lista de produtores com o maior intervalo entre prêmios
 *           items:
 *             $ref: '#/components/schemas/ProducerInterval'
 *       example:
 *         min:
 *           - producer: Joel Silver
 *             interval: 1
 *             previousWin: 1990
 *             followingWin: 1991
 *         max:
 *           - producer: Matthew Vaughn
 *             interval: 13
 *             previousWin: 2002
 *             followingWin: 2015
 *
 *     Error:
 *       type: object
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *           example: Internal server error
 */

export interface ProducerInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

export interface ProducerIntervalResponse {
  min: ProducerInterval[];
  max: ProducerInterval[];
}
