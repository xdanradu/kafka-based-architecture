import './todos.module.scss';
import { Todo } from '@advanced-monorepo/api-interfaces';

/* eslint-disable-next-line */
export interface TodosProps {}

export const Todos = (props: { todos: Todo[] }) => {
  return (
    <ul>
      {props.todos.map((t, i) => (
        <li key={i} className={'todo'}>{t.title}</li>
      ))}
    </ul>
  );
};

export default Todos;
