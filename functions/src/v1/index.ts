import * as express from 'express'
import Transaction from './transaction'

const app = express()

app.use('/v1', Transaction)

export default app
