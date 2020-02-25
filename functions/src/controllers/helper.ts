import { firestore } from 'firebase-admin'

export const rootRef = () => firestore().collection('account').doc('v1')

export const getTransactionRef = (ref: firestore.DocumentReference, id: string, year: number, month: number, date: number) => {
	return ref
		.collection('years').doc(`${year}`)
		.collection('months').doc(`${year}-${month}`)
		.collection('dates').doc(`${year}-${month}-${date}`)
		.collection('transactions').doc(id)
}
