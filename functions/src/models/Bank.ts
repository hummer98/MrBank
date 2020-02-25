import { firestore } from 'firebase-admin'
import { Currency } from '../util/Currency'

export interface Bank {
	isAvailable: boolean
	defaultCurrency: Currency
	createTime: firestore.Timestamp | firestore.FieldValue
	updateTime: firestore.Timestamp | firestore.FieldValue
}

export const isBank = (data: any): data is Bank => {
	return (typeof data.isAvailable === 'boolean')
}
