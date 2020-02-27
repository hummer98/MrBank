import { firestore } from 'firebase-admin'

export const rootRef = () => firestore().collection('account').doc('v1')
