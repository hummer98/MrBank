import { firestore } from 'firebase-admin'
import { Currency } from '../util/Currency'

export interface Account {
	isAvailable: boolean
	defaultCurrency: Currency
	createTime?: firestore.Timestamp | firestore.FieldValue
	updateTime: firestore.Timestamp | firestore.FieldValue
}

export const isAccount = (data: any): data is Account => {
	return (typeof data.isAvailable === 'boolean')
}
