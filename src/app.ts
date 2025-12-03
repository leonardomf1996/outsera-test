import * as path from 'node:path';
import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

import routes from './http/routes';
import { ImportMoviesUseCase } from './application/use-cases/ImportMoviesUseCase';
import { MovieRepository } from './infrastructure/repositories/MovieRepository';
import { swaggerSpec } from './config/swagger';

export class App {
  public app: Application;
  private importMoviesUseCase: ImportMoviesUseCase;

  constructor() {
    this.app = express();
    this.importMoviesUseCase = new ImportMoviesUseCase(new MovieRepository());
    this.setupMiddlewares();
    this.setupSwagger();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    this.app.use(express.json());
  }

  private setupSwagger(): void {
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Golden Raspberry Awards API',
    }));
    
    this.app.get('/swagger.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  private setupRoutes(): void {
    this.app.use('/', routes);
  }

  public async initDatabase(): Promise<void> {
    const { Database } = require('./infrastructure/database/Database');
    await Database.getInstance().waitForInit();
    const csvPath = path.join(__dirname, '../Movielist.csv');
    await this.importMoviesUseCase.execute(csvPath);
  }
}
