import * as admin from 'firebase-admin'
import * as v1 from './functions/v1'

admin.initializeApp()

export { v1 }
