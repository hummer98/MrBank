// import * as functions from 'firebase-functions'
// import * as express from 'express'
// import * as cors from 'cors'
import * as func from './functions/v1'

// const app = express()
// app.use(cors({ origin: true }))
// app.use('/_', V1)

// export const API = functions.https.onRequest(app)


export const v1 = { ...func }
