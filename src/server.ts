import { App } from './app';

const PORT = process.env.PORT || 3000;

const appInstance = new App();

appInstance.initDatabase()
  .then(() => {
    appInstance.app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });
