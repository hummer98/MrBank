import * as functions from 'firebase-functions'
import * as express from 'express'
import V1 from './v1'

const app = express()
app.use('/_', V1)

export const API = functions.https.onRequest(app)
