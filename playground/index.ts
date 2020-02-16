import * as admin from 'firebase-admin'
import * as Dayjs from 'dayjs'
var serviceAccount = require("../secret.json")

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://mrbank-bank.firebaseio.com"
})

export const playground = async () => {

	const now = admin.firestore.Timestamp.now()
	const day = Dayjs(now.toDate())
	console.log(day.year())
	// try {
	// 	await admin.firestore()
	// 	.collection('account').doc('v1')
	// 	.collection('accounts').doc('uid')
	// 	.collection('JPY').doc('s')
	// } catch (error) {
	// 	console.log(error)
	// }
}

playground()
