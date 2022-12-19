'use strict'

const Issue = use('App/Models/MamIssue')
const moment = require('moment')
const MasShift = use('App/Models/MasShift')
const MasSite = use('App/Models/MasSite')
const MasPit = use('App/Models/MasPit')
const DailyStoppageIssue = use('App/Models/DailyStoppageIssue')
const MasEvent = use('App/Models/MasEvent')
const _ = require('underscore')
const { GENERATE_WEEK_ARRAY } = use('App/Controllers/Http/customClass/utils')

class DailyStoppageIssueHelpers {
	async ALL(req) {
		try {
			const limit = parseInt(req.limit) || 100
			const halaman = req.page === undefined ? 1 : parseInt(req.page)
			let data
			if (req.keyword) {
				data = await DailyStoppageIssue.query()
					.with('user')
					.with('pit')
					.with('event')
					.with('shift')
					.where((w) => {
						w.whereNull('end_at')
						if (req.event_id) {
							w.where('event_id', req.event_id)
						}
						if (req.pit_id) {
							w.where('pit_id', req.pit_id)
						}
					})
					.orderBy('start_at', 'desc')
					.paginate(halaman, limit)
			} else {
				data = await DailyStoppageIssue.query().with('user').with('pit').with('event').with('shift').orderBy('start_at', 'desc').paginate(halaman, limit)
			}

			// let data1 = {
			//     ...data,
			//     data : data.data.map((v) => {
			//         return {
			//             ...v,
			//             date : moment(v.date).format('DD, MMM YYYY'),
			//             time : `${moment(v.start_at).format('HH:mm')} - ${moment(v.end_at).format('HH:mm')} - (${v.duration} hrs)`
			//         }
			//     })
			// }
			// console.log('data >> ', data1.data);
			data = {
				...data.toJSON(),
				data: data.toJSON().data.map((v) => {
					return {
						...v,
						time: v.end_at ? `${moment(v.start_at).format('DD/MM HH:mm')} - ${moment(v.end_at).format('DD/MM HH:mm')} - (${v.duration} hrs)` : `${moment(v.start_at).format('DD/MM/YY HH:mm')} - Ongoing`,
					}
				}),
			}
			return data
		} catch (err) {
			throw new Error(err)
		}
	}

	async POST(req, user) {
		try {
			const { pit_id, event_id, date_start, date_end, description, shift_id } = req

			if (!date_start) {
				return {
					success: false,
					message: 'Please pick starting date first!.',
					data: [],
				}
			}

			const dateStartReplace = date_start.replace('T', ' ')
			const dateEndReplace = date_end ? date_end.replace('T', ' ') : null
			const start = moment(dateStartReplace).format('YYYY-MM-DD HH:mm:ss')
			const end = moment(dateEndReplace).format('YYYY-MM-DD HH:mm:ss')
			const issue = new DailyStoppageIssue()

			const check_existing_issue = await DailyStoppageIssue.query()
				.where((wh) => {
					wh.where('pit_id', pit_id)
					wh.where('event_id', event_id)
					wh.where('shift_id', shift_id)
					wh.where('start_at', start)
					wh.where('end_at', end)
					wh.where('description', description)
					wh.where('date', start.split(' ')[0])
					wh.where('duration', moment(end).diff(start, 'hours'))
					wh.where('user_id', user.id)
				})
			.first()

			if (check_existing_issue) {
				return {
					success: false,
					message: 'Data is already Exist, please try another one!',
					data: []
				}
			}

			issue.fill({
				pit_id,
				event_id,
				shift_id,
				start_at: start,
				end_at: end,
				description,
				date: start.split(' ')[0],
				duration: moment(end).diff(start, 'hours'),
				user_id: user.id,
			})
			await issue.save()

			return {
				success: true,
				message: 'Success save data...',
				data: issue.toJSON(),
			}
		} catch (error) {
			console.log(error)
			return {
				success: false,
				message: 'Failed save data...' + JSON.stringify(error),
			}
		}
	}

	async SHOW(params) {
		let data = (await DailyStoppageIssue.query().with('pit').with('shift').with('user').with('event').where('id', params.id).last()).toJSON()

		data = {
			...data,
			start_at: moment(data.start_at).format('YYYY-MM-DDTHH:mm'),
			end_at: moment(data.end_at).format('YYYY-MM-DDTHH:mm'),
		}
		return data
	}

	async SHOW_BY_RANGE_DATE({ dateStart, dateEnd, pit_id, type }) {
		try {
			const dailyReasonArr = []
			const weeklyReasonArr = []
			const pit = await MasPit.query()
				.where((wh) => {
					wh.where('id', pit_id)
					wh.where('sts', 'Y')
				})
				.first()
			if (!pit) {
				throw new Error('Pit is not found!')
			}
			const globalEvents = (await MasEvent.query().whereIn('narasi', ['Rest & Meal', 'Dusty', 'Hazard', 'External Issue', 'Holiday & Shutdown', 'Rain', 'Slippery', 'Fog']).fetch()).toJSON()
			const globalEventsIds = globalEvents.map((v) => v.id)

			if (type === 'daily') {
				const issues = (
					await DailyStoppageIssue.query()
						.where((wh) => {
							wh.where('date', '>=', dateStart)
							wh.where('date', '<=', dateEnd)
							wh.where('pit_id', pit.id)
							wh.whereIn('event_id', globalEventsIds)
						})
						.with('event')
						.with('pit')
						.with('shift')
						.fetch()
				).toJSON()

				if (issues || issues.length > 0) {
					for (const value of issues) {
						const obj = {
							date: moment(value.date).format('YYYY-MM-DD'),
							desc: value.issue,
							issue: value.event.narasi,
							shift: value.shift.kode,
							period: `${moment(value.start_at).format('DD/MM HH:mm')} - ${moment(value.end_at).format('DD/MM HH:mm')}`,
							duration: `${value.duration} H`,
							pitName: value.pit.name,
							text: `${moment(value.start_at).format('DD/MM')} : ${value.pit.name} / ${value.event.narasi} / ${value.shift.kode} (${value.duration} H)`,
						}
						dailyReasonArr.push(obj)
					}
				}
				return dailyReasonArr
			}

			if (type === 'weekly') {
				const weekArray = await GENERATE_WEEK_ARRAY(dateStart, dateEnd)
				if (weekArray.length > 0) {
					for (const week of weekArray) {
						const issues = (
							await DailyStoppageIssue.query()
								.where((wh) => {
									wh.where('date', '>=', week.start)
									wh.where('date', '<=', week.end)
									wh.where('pit_id', pit.id)
									wh.whereIn('event_id', globalEventsIds)
								})
								.with('event')
								.with('pit')
								.with('shift')
								.fetch()
						).toJSON()
						return weeklyReasonArr
					}
				}
				return weekArray
			}
		} catch (err) {
			return {
				success: false,
				message: err.message,
			}
		}
	}

	async UPDATE(params, req) {
		const check = await DailyStoppageIssue.query().where('id', params.id).last()

		console.log('check >> ', check, params)
		if (!check) {
			return {
				success: false,
				message: 'Daily Stoppage Issue not found with this id... Try again',
			}
		};


		/**
		 * check if the end at are below start at
		 */


		const end_at = moment(req.end_at).format('YYYY-MM-DD HH:mm:ss');
		const diff = moment(end_at).diff(check.start_at, 'hours');


		if(new Date(end_at) <= new Date(check.start_at)) {
			return {
				success : false,
				message : 'END AT cannot be lower than START AT'
			}
		};

		check.merge({
			...req,
			duration : diff
		});

		await check.save()
		return {
			success : true,
			message : 'Success update daily stoppage issue',
			data : check
		};
	}

	// async DELETE(params){
	//     const eventTimeSheet = await EventTimeSheet.find(params.dailyEventID)
	//     if(eventTimeSheet){
	//         await eventTimeSheet.delete()
	//         return eventTimeSheet
	//     }else{
	//         throw new Error('Data daily event ID ::'+params.dailyEventID+' not found...')
	//     }
	// }
}

module.exports = new DailyStoppageIssueHelpers()
