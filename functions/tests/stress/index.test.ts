// process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
// import * as ftest from '@firebase/testing'
import * as admin from 'firebase-admin'
import * as V1 from '../../src/functions/v1'
// import * as functions from "firebase-functions"
import * as Deposit from '../../src/models/Deposit'
import * as Transfer from '../../src/models/Transfer'

// admin.initializeApp(functions.config().firebase)
const serviceAccount = require('../../../secret.json')
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://mrbank-bank.firebaseio.com"
});

const accountRef = admin.firestore().collection('account').doc('v1')

describe("Firestore triggerd test", () => {

	beforeAll(async () => {
		// await V1.account.create.run({
		// 	isAvailable: true,
		// 	defaultCurrency: 'JPY'
		// }, {
		// 	auth: {
		// 		uid: 'user_0'
		// 	}
		// })
		// await V1.account.create.run({
		// 	isAvailable: true,
		// 	defaultCurrency: 'JPY'
		// }, {
		// 	auth: {
		// 		uid: 'user_1'
		// 	}
		// })
		await accountRef.collection('accounts').doc('user_0').set({
			isAvailable: true,
			defaultCurrency: 'JPY',
			createTime: admin.firestore.FieldValue.serverTimestamp(),
			updateTime: admin.firestore.FieldValue.serverTimestamp()
		})
		await accountRef.collection('accounts').doc('user_1').set({
			isAvailable: true,
			defaultCurrency: 'JPY',
			createTime: admin.firestore.FieldValue.serverTimestamp(),
			updateTime: admin.firestore.FieldValue.serverTimestamp()
		})
		const request: Deposit.Request = {
			to: 'user_0',
			currency: 'JPY',
			amount: 1000,
		}
		const result = await V1.deposit.create.run(request, {
			auth: {
				uid: 'user_0'
			}
		})
		await V1.deposit.confirm.run({ id: result }, {
			auth: {
				uid: 'user_0'
			}
		})
	}, 10000)

	describe("Transfer", () => {
		beforeAll(async () => {
			const tasks = []
			for (let i = 0; i < 5; i++) {
				const task = async () => {
					const request: Transfer.Request = {
						from: 'user_0',
						to: 'user_1',
						currency: 'JPY',
						amount: 100,
					}
					const result = await V1.transfer.create.run(request, {
						auth: {
							uid: 'user_0'
						}
					})
					console.log('request result ', result)
					const confirm = await V1.transfer.confirm.run({ id: result }, {
						auth: {
							uid: 'user_0'
						}
					})
					console.log('confirm result', confirm)
				}
				tasks.push(task())
			}
			await Promise.all(tasks)
		}, 100000)

		test("Transfer amount 0 user_0", async () => {
			const snapshot = await accountRef.collection('accounts').doc('user_0').collection('balances').doc('JPY').collection('shards').get()
			const amount = snapshot.docs.reduce((prev, current) => {
				return prev + current.data()!.amount
			}, 0)
			expect(amount).toEqual(0)
		})

		test("Transfer amount 500 user_1", async () => {
			const snapshot = await accountRef.collection('accounts').doc('user_1').collection('balances').doc('JPY').collection('shards').get()
			const amount = snapshot.docs.reduce((prev, current) => {
				return prev + current.data()!.amount
			}, 0)
			expect(amount).toEqual(500)
		})

	})

	afterAll(async () => {

	})

})
