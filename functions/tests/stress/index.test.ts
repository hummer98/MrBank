process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
// import * as ftest from '@firebase/testing'
import * as admin from 'firebase-admin'
import * as functions from "firebase-functions"
import * as Deposit from '../../../functions/src/models/Deposit'
import * as Transfer from '../../../functions/src/models/Transfer'
import * as Withdraw from '../../../functions/src/models/Withdraw'

admin.initializeApp(functions.config().firebase)

// // const Test = functions({
// // 	databaseURL: 'http://localhost:8080',
// // 	storageBucket: 'test-project.appspot.com',
// // 	projectId: 'test-project',
// // },
// // 	"../../../secret.json")


// const adminApp = ftest.initializeAdminApp({
// 	projectId: "test-project"
// })
// const firebase = ftest.initializeTestApp({
// 	projectId: "test-project",
// 	auth: { uid: "test-user" }
// })

import * as V1 from '../../src/functions/v1'

// console.info(firebase.firestore(), adminApp)

const accountRef = admin.firestore().collection('account').doc('v1')

describe("Firestore triggerd test", () => {

	beforeAll(async () => {
		await V1.account.create.run({
			isAvailable: true,
			defaultCurrency: 'JPY'
		}, {
			auth: {
				uid: 'user_0'
			}
		})
		await V1.account.create.run({
			isAvailable: true,
			defaultCurrency: 'JPY'
		}, {
			auth: {
				uid: 'user_1'
			}
		})
	}, 10000)

	test("Get account", async () => {
		const doc = accountRef.collection('accounts').doc('user_0')
		const result = await doc.get()
		expect(result.data()!.isAvailable).toEqual(true)
		expect(result.data()!.defaultCurrency).toEqual('JPY')
	})

	test("Get account", async () => {
		const doc = accountRef.collection('accounts').doc('user_1')
		const result = await doc.get()
		expect(result.data()!.isAvailable).toEqual(true)
		expect(result.data()!.defaultCurrency).toEqual('JPY')
	})

	describe("Deposit", () => {
		beforeAll(async () => {
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

		test("Deposit", async () => {
			const snapshot = await accountRef.collection('accounts').doc('user_0').collection('balances').doc('JPY').collection('shards').get()
			const amount = snapshot.docs.reduce((prev, current) => {
				return prev + current.data()!.amount
			}, 0)
			expect(amount).toEqual(1000)
		})
	})

	describe("Transfer", () => {
		beforeAll(async () => {
			const request: Transfer.Request = {
				from: 'user_0',
				to: 'user_1',
				currency: 'JPY',
				amount: 500,
			}
			const result = await V1.transfer.create.run(request, {
				auth: {
					uid: 'user_0'
				}
			})
			await V1.transfer.confirm.run({ id: result }, {
				auth: {
					uid: 'user_0'
				}
			})
		}, 10000)

		test("Transfer amount 500 user_0", async () => {
			const snapshot = await accountRef.collection('accounts').doc('user_0').collection('balances').doc('JPY').collection('shards').get()
			const amount = snapshot.docs.reduce((prev, current) => {
				return prev + current.data()!.amount
			}, 0)
			expect(amount).toEqual(500)
		})

		test("Transfer amount 500 user_1", async () => {
			const snapshot = await accountRef.collection('accounts').doc('user_1').collection('balances').doc('JPY').collection('shards').get()
			const amount = snapshot.docs.reduce((prev, current) => {
				return prev + current.data()!.amount
			}, 0)
			expect(amount).toEqual(500)
		})
	})

	describe("Withdraw", () => {
		beforeAll(async () => {
			const request: Withdraw.Request = {
				from: 'user_0',
				currency: 'JPY',
				amount: 500,
			}
			const result = await V1.withdraw.create.run(request, {
				auth: {
					uid: 'user_0'
				}
			})
			await V1.withdraw.confirm.run({ id: result }, {
				auth: {
					uid: 'user_0'
				}
			})
		}, 10000)

		test("Transfer amount 500 user_0", async () => {
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

})
