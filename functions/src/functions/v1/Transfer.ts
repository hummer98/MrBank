import * as functions from 'firebase-functions'
import TransferController from '../../controllers/account/TransferController'
import * as Transfer from '../../models/Transfer'

export const create = functions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	console.log(context)
	const from = context.auth.uid
	const { to, currency, amount }: Partial<Transfer.Request> = data
	if (!to) {
		throw new functions.https.HttpsError('invalid-argument', 'The function requires to`.')
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
		const request: Transfer.Request = {
			from,
			to,
			currency,
			amount
		}
		const result = await TransferController.request(request)
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
	const from = context.auth.uid
	const id = data.id
	if (!id) {
		throw new functions.https.HttpsError('invalid-argument', 'The function requires `id`.')
	}
	try {
		const result = await TransferController.confirm(from, id)
		return result
	} catch (error) {
		throw error
	}
})

