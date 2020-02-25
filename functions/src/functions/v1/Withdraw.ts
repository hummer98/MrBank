import * as functions from 'firebase-functions'
import WthdrawController from '../../controllers/WthdrawController'
import * as Withdraw from '../../models/Withdraw'

export const create = functions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	console.log(context)
	const { from, currency, amount }: Partial<Withdraw.Request> = data
	if (!from) {
		throw new functions.https.HttpsError('invalid-argument', 'The function requires `from`.')
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
		const request: Withdraw.Request = {
			from,
			currency,
			amount
		}
		const result = await WthdrawController.request(request)
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
		const result = await WthdrawController.confirm(id)
		return result
	} catch (error) {
		throw error
	}
})

