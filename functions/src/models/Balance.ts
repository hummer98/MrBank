import { firestore } from 'firebase-admin'
import { Currency } from '../util/Currency'

export interface Balance {
	amount: { [currency in Currency]?: number }
	createTime?: firestore.Timestamp | firestore.FieldValue
	updateTime: firestore.Timestamp | firestore.FieldValue
}

// export const isBalance = (data: any): data is Balance => {
// 	return (typeof data.createTime === 'boolean')
// }
