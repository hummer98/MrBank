import * as functions from 'firebase-functions'
import DepositController from '../../controllers/account/DepositController'
import * as Deposit from '../../models/Deposit'

export const create = functions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	console.log(context)
	const { to, currency, amount }: Partial<Deposit.Request> = data
	if (!to) {
		throw new functions.https.HttpsError('invalid-argument', 'The function requires `to`.')
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
		const request: Deposit.Request = {
			to,
			currency,
			amount
		}
		const result = await DepositController.request(request)
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
		const result = await DepositController.confirm(id)
		return result
	} catch (error) {
		throw error
	}
})

