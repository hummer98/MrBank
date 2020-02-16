import { firestore } from 'firebase-admin'
import * as functions from 'firebase-functions'
import { Account } from '../../models/Account'

const system = firestore().collection('account').doc('v1')

export const create = functions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	console.log(context)
	const uid: string = context.auth.uid
	const { isAvailable, defaultCurrency }: Partial<Account> = data
	try {
		const documentReference = system.collection('accounts').doc(uid)
		const documentData: Partial<Account> = {
			isAvailable,
			defaultCurrency,
			createTime: firestore.FieldValue.serverTimestamp(),
			updateTime: firestore.FieldValue.serverTimestamp()
		}
		const result = await documentReference.create(documentData)
		return result
	} catch (error) {
		throw error
	}
})

export const update = functions.https.onCall(async (data, context) => {
	if (!context.auth) {
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
	}
	console.log(context)
	const uid: string = context.auth.uid
	const { isAvailable, defaultCurrency }: Partial<Account> = data
	try {
		const documentReference = system.collection('accounts').doc(uid)
		const documentData: Partial<Account> = {
			isAvailable,
			defaultCurrency,
			updateTime: firestore.FieldValue.serverTimestamp()
		}
		const result = await documentReference.create(documentData)
		return result
	} catch (error) {
		throw error
	}
})
