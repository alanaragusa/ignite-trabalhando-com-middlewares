const express = require('express');
const cors = require('cors');

const { v4: uuidv4, validate } = require('uuid');
const { use } = require('express/lib/application');

const app = express();
app.use(express.json());
app.use(cors());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // receber o username pelo header //
  const { username } = request.headers;

  // validar se existe ou não usuário com o username passado //
  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({error: "User not found"})
  };

  // repassar o usuário para o request //
  request.user = user;

  // função next //
  return next();
}

function checksCreateTodosUserAvailability(request, response, next) {
  // receber o usuário já dentro do request //
  const { user } = request;

  // função next - apenas se o usuário estiver no plano grátis e ainda não possuir 10 todos cadastrados ou se ele já estiver com o plano Pro ativado //
  if (!user.pro && user.todos.length >= 10) {
    return response.status(403).json({error:"Time to go Pro to add more todos!"})
  }
}

function checksTodoExists(request, response, next) {
  // username do header //
  const { username } = request.headers;

  // id de um todo do request.params //
  const { id } = request.params;

  // validar o usuário //
  const user = users.find(user => username === user.username);

  if (!user) {
    return response.status(404).json({error: "User not found"});
  };

  // validar o id como uuid //
  if (!validate(id)) {
    return response.status(400).json({error:"Id is not valid"})
  };

  // validar que o id pertence a um todo do usuário informado //
  const todo = user.todos.find(todo => id === todo.id);

  if (!todo){
    return response.status(404).json({error:"Todo not found"})
  };

  // passar o todo e usuário para o request //
  request.user = user;
  request.todo = todo;

  // função next //
  return next();
}

function findUserById(request, response, next) {
  // busca pelo usuário deve ser feita pelo id de um usuário passado por parâmetro de rota //
  const { id } = request.params;

  // caso o usuário exista, repassar para dentro do request.user//
  const user = users.find(user => id === user.id);

  if (!user) {
    return response.status(404).json({error: "User does not exist"});
  };

  request.user = user;

  // função next //
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some((user) => user.username === username);

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    pro: false,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/users/:id', findUserById, (request, response) => {
  const { user } = request;

  return response.json(user);
});

app.patch('/users/:id/pro', findUserById, (request, response) => {
  const { user } = request;

  if (user.pro) {
    return response.status(400).json({ error: 'Pro plan is already activated.' });
  }

  user.pro = true;

  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, checksCreateTodosUserAvailability, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksTodoExists, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksTodoExists, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { user, todo } = request;

  const todoIndex = user.todos.indexOf(todo);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = {
  app,
  users,
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  checksTodoExists,
  findUserById
};