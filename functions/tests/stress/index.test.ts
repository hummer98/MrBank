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

		const tasks = []
		for (let i = 0; i < 50; i++) {
			const task = async () => {
				const userID = `user_${i}`
				await accountRef.collection('accounts').doc(userID).set({
					isAvailable: true,
					defaultCurrency: 'JPY',
					createTime: admin.firestore.FieldValue.serverTimestamp(),
					updateTime: admin.firestore.FieldValue.serverTimestamp()
				})
				const request: Deposit.Request = {
					to: userID,
					currency: 'JPY',
					amount: 100,
				}
				const result = await V1.deposit.create.run(request, {
					auth: {
						uid: userID
					}
				})
				await V1.deposit.confirm.run({ id: result }, {
					auth: {
						uid: userID
					}
				})
			}
			tasks.push(task())
		}
		await Promise.all(tasks)
		await accountRef.collection('accounts').doc('user_target').set({
			isAvailable: true,
			defaultCurrency: 'JPY',
			createTime: admin.firestore.FieldValue.serverTimestamp(),
			updateTime: admin.firestore.FieldValue.serverTimestamp()
		})
	}, 10000)

	describe("Transfer", () => {
		beforeAll(async () => {
			const tasks = []
			for (let i = 0; i < 50; i++) {
				const task = async () => {
					const userID = `user_${i}`
					const request: Transfer.Request = {
						from: userID,
						to: 'user_target',
						currency: 'JPY',
						amount: 100,
					}
					const result = await V1.transfer.create.run(request, {
						auth: {
							uid: userID
						}
					})
					console.log('request result ', result)
					const confirm = await V1.transfer.confirm.run({ id: result }, {
						auth: {
							uid: userID
						}
					})
					console.log('confirm result', confirm)
				}
				tasks.push(task())
			}
			const result = await Promise.all(tasks)
			console.log(result)
		}, 1000000)

		test("Transfer ", async () => {
			const tasks = []
			for (let i = 0; i < 50; i++) {
				const task = async () => {
					const userID = `user_${i}`
					const snapshot = await accountRef.collection('accounts').doc(userID).collection('balances').doc('JPY').collection('shards').get()
					const amount = snapshot.docs.reduce((prev, current) => {
						return prev + current.data()!.amount
					}, 0)
					expect(amount).toEqual(0)
				}
				tasks.push(task())
			}
			const result = await Promise.all(tasks)
			console.log(result)
		})

	})

	afterAll(async () => {

	})

})
