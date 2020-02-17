import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'
import { Transaction } from '../../models/Transaction'
import { DafaultShardCharacters } from '../../util/Shard'
import TransactionController from '../../controllers/TransactionController'
import { AccountConfiguration } from '../../models/AccountConfiguration'
import { TransferRequest } from '../../models/TransferAuthorization'

const system = () => firestore().collection('account').doc('v1')

export const create = functions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	console.log(context)
	const { from, to, currency, amount }: Partial<TransferRequest> = data
	if (!from || !to) {
		throw new functions.https.HttpsError('invalid-argument', 'The function requires `from` and `to`.')
	}
	if (!currency) {
		throw new functions.https.HttpsError('invalid-argument', 'The function requires `currency`.')
	}
	if (!amount) {
		throw new functions.https.HttpsError('invalid-argument', 'The function requires `amount`.')
	}
	if (amount < 100) {
		throw new functions.https.HttpsError('invalid-argument', '`amount` must be at least 100.')
	}
	try {
		const request: TransferRequest = {
			from,
			to,
			currency,
			amount
		}
		const result = await TransactionController.request(request)
		return result
	} catch (error) {
		throw error
	}
})

export const confirm = functions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	console.log(context)
	const id = data.id
	if (!id) {
		throw new functions.https.HttpsError('invalid-argument', 'The function requires `id`.')
	}
	try {
		const result = await TransactionController.transfer(id)
		return result
	} catch (error) {
		throw error
	}
})

