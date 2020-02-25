import * as admin from 'firebase-admin'
import * as V1 from './functions/v1'

admin.initializeApp()

export { V1 }
