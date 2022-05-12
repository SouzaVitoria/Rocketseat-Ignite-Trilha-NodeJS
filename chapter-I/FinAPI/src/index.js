import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(express.json())

const customers = []

const verifyIfExistsAccountCPF = (req, res, next) => {
  const { cpf } = req.headers
  const customer = customers.find((current) => current.cpf === cpf)

  if (!customer) {
    return res.status(404).send({ error: 'Customer not found' })
  }

  req.customer = customer
  return next()
}

const getBalance = (statement) => {
  const balance = statement.reduce((acumulator, operation) => {
    if (operation.type === 'credit') {
      return acumulator + operation.amount
    } else {
      return acumulator - operation.amount
    }
  }, 0)

  return balance
}

app.post('/account', (req, res) => {
  const { cpf, name } = req.body
  const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf)

  if (customerAlreadyExists) res.status(400).send({ error: 'customer already exists' })

  customers.push({
    name,
    cpf,
    id: uuidv4(),
    statement: []
  })

  res.status(201).send(customers)
})

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req

  if (customer.statement.length === 0) {
    return res.status(204).send(customer.statement)
  }

  res.status(200).send(customer.statement)
})

app.post('/deposit', verifyIfExistsAccountCPF, (req, res) => {
  const { description, amount } = req.body
  const { customer } = req

  const statementOperation = {
    description,
    amount,
    created_at: new Date().toLocaleDateString('pt-br', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    type: 'credit'
  }

  customer.statement.push(statementOperation)

  return res.status(201).send(customer)
})

app.post('/withdraw', verifyIfExistsAccountCPF, (req, res) => {
  const { amount } = req.body
  const { customer } = req
  const balance = getBalance(customer.statement)

  if (balance < amount) {
    return res.status(400).send({ error: 'Insufficient funds.' })
  }

  const statementOperation = {
    amount,
    created_at: new Date().toLocaleDateString('pt-br', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    type: 'debit'
  }

  customer.statement.push(statementOperation)

  return res.status(201).send()
})

app.listen(3333, () => console.log('Running'))