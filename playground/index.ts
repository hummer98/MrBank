import * as admin from 'firebase-admin'
var serviceAccount = require("../secret.json")

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://mrbank-bank.firebaseio.com"
})

export const playground = async () => {

	try {
		await admin.firestore().collection('hoge').doc('ee').create({ a: "hoge" })
	} catch (error) {
		console.log(error)
	}
}

playground()
