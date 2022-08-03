const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not exists!" });
  }

  request.user = user;

  return next();
}

function checksExistsTodo(response, id, user) {
  const todoExists = user.todos.some((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not exists!" });
  }
}

app.get("/users", (request, response) => {
  return response.status(200).json(users);
});

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const checkUsernameExists = users.some((user) => user.username === username);

  if (checkUsernameExists) {
    return response.status(400).json({ error: "username already exists!" });
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const todos = user.todos;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  user.todos.push({
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });

  return response.status(201).json(user.todos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  checksExistsTodo(response, id, user);

  const todoIndex = user.todos.findIndex((todo) => todo.id == id);
  const todo = user.todos[todoIndex];

  todo.title = title;
  todo.deadline = deadline;

  user.todos[todoIndex] = todo;

  return response.status(200).json(user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  checksExistsTodo(response, id, user);

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  user.todos[todoIndex].done = true;

  return response.status(200).json(user.todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  checksExistsTodo(response, id, user);
  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
