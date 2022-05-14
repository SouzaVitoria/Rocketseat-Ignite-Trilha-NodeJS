const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)

  if (!user) return response.status(404).send({ error: 'User not found' })

  request.user = user

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  response.status(201).send(users)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  response.status(200).send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  })

  response.status(201).send(user.todos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)
  todo.title = title
  todo.deadline = deadline

  response.status(200).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)
  todo.done = true
  response.status(200).send()
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex === -1) {
    return response.status(404).send("Todo not found")
  }

  user.todos.splice(todoIndex, 1)

  response.status(200).send()
});

module.exports = app;