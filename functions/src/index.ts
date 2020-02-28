import * as admin from 'firebase-admin'
import * as func from './functions/v1'

admin.initializeApp()
export const v1 = {
	...func
}
