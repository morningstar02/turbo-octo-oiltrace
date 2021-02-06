import App from './app';
require('source-map-support').install();
import { StatusController } from './controllers/status.controller';
const app = new App([
    new StatusController(),
]);

app.listen();
