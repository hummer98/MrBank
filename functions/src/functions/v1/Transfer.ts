import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'
import { Transaction } from '../../models/Transaction'
import { DafaultShardCharacters } from '../../util/Shard'
import TransactionController from '../../controllers/TransactionController'
import { AccountConfiguration } from '../../models/AccountConfiguration'

const system = () => firestore().collection('account').doc('v1')

export const create = functions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	console.log(context)
	const { from, to, currency, amount, executionTime }: Partial<Transaction> = data
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
	const [fromConfigurationSnapshot, toConfigurationSnapshot] = await Promise.all([
		system().collection('accountConfigurations').doc(from.id).get(),
		system().collection('accountConfigurations').doc(to.id).get()
	])
	const fromConfiguration = fromConfigurationSnapshot?.data() as AccountConfiguration | undefined
	const toConfiguration = toConfigurationSnapshot?.data() as AccountConfiguration | undefined
	const fromShardCharcters = fromConfiguration?.shardhardCharacters || DafaultShardCharacters
	const toShardCharcters = toConfiguration?.shardhardCharacters || DafaultShardCharacters
	try {
		const transaction: Transaction = {
			from,
			to,
			currency,
			amount,
			executionTime: executionTime || firestore.FieldValue.serverTimestamp()
		}
		const result = await TransactionController.transfer(transaction, fromShardCharcters, toShardCharcters)
		return result
	} catch (error) {
		throw error
	}
})

