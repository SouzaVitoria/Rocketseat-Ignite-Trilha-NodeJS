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

  if (customer.statement.length === 0) {
    return res.status(204).send(customer.statement)
  }

  req.customer = customer
  return next()
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
  res.status(200).send(customer.statement)
})

app.listen(3333, () => console.log('Running'))