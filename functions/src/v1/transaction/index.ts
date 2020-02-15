import { firestore } from 'firebase-admin'
import * as express from 'express'
import { Dayjs } from 'dayjs'
import { Transaction } from '../../models/Transaction'

const app = express()

app.post('/transaction', async (req, res) => {

	//
	const timestamp = firestore.Timestamp.now()
	const dayjs = new Dayjs(timestamp.toDate())
	const year = dayjs.year()
	const month = dayjs.month()
	const date = dayjs.date()

	//
	const bank = req.query.bank
	const branch = req.query.branch
	const fromID = req.query.fromID
	const toID = req.query.toID

	const from = firestore()
	.collection('banks').doc(bank)
	.

	const transactionReference = firestore()
		.collection('banks').doc(bank)
		.collection('branches').doc(branch)
		.collection('year').doc(`${year}`)
		.collection('month').doc(`${month}`)
		.collection('day').doc(`${date}`)
		.collection('transactions').doc()

	const transactionData: Transaction = {
		from:
	}

	try {
		await firestore().runTransaction(async transaction => {
			transaction.set(transactionReference)
		})
	} catch (error) {

	}


})

export default app
