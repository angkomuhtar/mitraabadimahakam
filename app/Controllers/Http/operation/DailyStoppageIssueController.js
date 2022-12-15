'use strict'

const DB = use('Database')
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require('moment')
const DailyEvent = use('App/Models/DailyEvent')
const MamIssue = use('App/Models/MamIssue')
const IssueHelpers = use('App/Controllers/Http/Helpers/DailyIssue')
const DailyStoppageIssueHelpers = use('App/Controllers/Http/Helpers/DailyStoppageIssue')

class DailyStoppageIssueController {
	async index({ auth, view }) {
		const user = await userValidate(auth)
		if (!user) {
			return
		}
		return view.render('operation.daily-stoppage-issue.index')
	}

	async list({ request, view }) {
		const req = request.all()
		const data = await DailyStoppageIssueHelpers.ALL(req)
		return view.render('operation.daily-stoppage-issue.list', {
			list: data,
		})
	}

	async create({ request, view }) {
		const req = request.all()
		return view.render('operation.daily-stoppage-issue.create')
	}

	async store({ auth, request }) {
		const req = request.all()

		const user = await userValidate(auth)
		if (!user) {
			return
		}
		try {
			const { data, success, message } = await DailyStoppageIssueHelpers.POST(req, user)
			return {
				success: success,
				message: message,
				data: data,
			}
		} catch (err) {
			return {
				success: false,
				message: err.message,
			}
		}
	}

	async show({ auth, params, view }) {
		await auth.getUser()
		const data = await DailyStoppageIssueHelpers.SHOW(params)

		console.log('data >> ', data);
		return view.render('operation.daily-stoppage-issue.show', {
			data: data,
		})
	}

	async update({ auth, params, request, view }) {
		let user = await auth.getUser()
		const req = request.all()
		return {
			success: true,
			message: 'Success save data...',
		}
	}

	async destroy({ auth, params }) {
		console.log(params)
		await auth.getUser()
		try {
			const issue = await MamIssue.query().where('id', params.id).last()
			if (issue.dailyevent_id) {
				await DailyEvent.query().where('id', issue.dailyevent_id).delete()
			}
			await MamIssue.query().where('id', params.id).delete()
			return {
				success: true,
				message: 'Success save data...',
			}
		} catch (error) {
			console.log(error)
			return {
				success: false,
				message: 'Failed save data issue...' + JSON.stringify(error),
			}
		}
	}
}

module.exports = DailyStoppageIssueController

async function userValidate(auth) {
	let user
	try {
		user = await auth.getUser()
		return user
	} catch (error) {
		console.log('error >> ', error)
		return null
	}
}
