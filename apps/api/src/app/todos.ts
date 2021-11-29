import { Express } from 'express';
import { Todo } from '@advanced-monorepo/api-interfaces';
import * as shared from '@advanced-monorepo/shared';

const todos: Todo[] = [{ title: 'Todo 1' }, { title: 'Todo 2' }];

export function addTodoRoutes(app: Express) {

  app.get('/api/todos', (req, resp)  => {

    shared.executeKafkaRequest('get_todos', { data: '123' }, function(err, results) {
      if (err) {
        console.log("Inside err");
      }
      else {
        console.log("REST API Results received successfully from kafka api");
        console.log(JSON.stringify(results));
      }
    });


      resp.send(todos);
    }
  );
  app.post('/api/addTodo', (req, resp) => {
    const newTodo = {
      title: `New todo ${Math.floor(Math.random() * 1000)}`,
    };
    todos.push(newTodo);
    resp.send(newTodo);
  });
}
