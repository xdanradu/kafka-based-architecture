import * as express from 'express';
import { Message } from '@advanced-monorepo/api-interfaces';
import { addTodoRoutes } from './app/todos';

const app = express();

const greeting: Message = { message: 'Welcome to api!' };

app.get('/api', (req, res) => {
  res.send(greeting);
});
addTodoRoutes(app);

const port = process.env.port || 3001;
const server = app.listen(port, () => {
  console.log('Listening at http://localhost:' + port + '/api');
});
server.on('error', console.error);
