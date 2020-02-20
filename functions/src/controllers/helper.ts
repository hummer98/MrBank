import { firestore } from 'firebase-admin'

export const getTransactionRef = (ref: firestore.DocumentReference, id: string, year: number, month: number, date: number) => {
	return ref
		.collection('years').doc(`${year}`)
		.collection('months').doc(`${year}-${month}`)
		.collection('dates').doc(`${year}-${month}-${date}`)
		.collection('transactions').doc(id)
}
