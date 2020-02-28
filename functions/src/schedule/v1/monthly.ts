import * as functions from 'firebase-functions'
import { rootRef } from './helper'

export const monthly = functions.pubsub.schedule('0 0 0 * *').onRun((context) => {
	console.log(context)
	rootRef().collection('')
});
