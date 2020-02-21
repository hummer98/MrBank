import * as admin from 'firebase-admin'

admin.initializeApp()

const FUNCTION_NAME = process.env.FUNCTION_NAME
if (FUNCTION_NAME) {
	const names = FUNCTION_NAME.split('-')
	const path = names.slice(0, names.length - 1).join('/')
	const name = [...names].pop()!
	const file = require(`./functions/${path}`)
	const func = names.reduceRight((prev, current) => {
		return { [current]: prev }
	}, file[name])
	module.exports = func
} else {
	const func = require('./functions/v1')
	const v1 = { ...func }
	module.exports = { v1 }
}
