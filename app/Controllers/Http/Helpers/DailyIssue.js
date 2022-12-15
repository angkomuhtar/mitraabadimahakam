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
class dailyIssue {
	async ALL(req) {
		const limit = parseInt(req.limit) || 100
		const halaman = req.page === undefined ? 1 : parseInt(req.page)
		let data
		if (req.keyword) {
			data = await Issue.query()
				.with('user')
				.with('pit')
				.with('dailyevent', (w) => w.with('event'))
				.with('unit')
				.where((w) => {
					w.whereNull('end_at')
					if (req.event_id) {
						w.where('event_id', req.event_id)
					}
					if (req.pit_id) {
						w.where('pit_id', req.pit_id)
					}
					if (req.start_at && req.end_at) {
						w.where('report_at', '>=', moment(req.start_at).startOf('day').format('YYYY-MM-DD HH:mm'))
						w.where('report_at', '<=', moment(req.end_at).endOf('day').format('YYYY-MM-DD HH:mm'))
					}
					if (req.issue) {
						w.where('issue', 'like', `%${req.issue}%`)
					}
					if (req.unit_id) {
						w.whereIn('unit_id', req.unit_id)
					}
				})
				.orderBy('report_at', 'desc')
				.paginate(halaman, limit)
		} else {
			data = await Issue.query()
				.with('user')
				.with('pit')
				.with('dailyevent', (w) => w.with('event'))
				.with('unit')
				.orderBy('report_at', 'desc')
				.paginate(halaman, limit)
		}

		return data
	}

	async POST(req, user) {
		try {
			const issue = new Issue()
			issue.fill(req)
			await issue.save()
			return {
				success: true,
				message: 'Success save data...',
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
		const data = (
			await Issue.query()
				.with('user')
				.with('dailyevent', (w) => w.with('event'))
				.with('unit')
				.where('id', params.id)
				.last()
		).toJSON()
		// data.arrUnit = data.unit.map(el => el.id)
		console.log(data)
		return data
	}

	async SHOW_TODAY() {
		console.log('>> ', moment().startOf('day').format('YYYY-MM-DD HH:mm'))
		const data = (
			await Issue.query()
				.with('user')
				.with('dailyevent', (w) => w.with('event'))
				.with('unit')
				.where((w) => {
					w.where('report_at', '>=', moment('2022-11-25 00:00').startOf('day').format('YYYY-MM-DD HH:mm'))
					w.where('report_at', '<=', moment('2022-11-25 00:00').endOf('day').format('YYYY-MM-DD HH:mm'))
				})
				.orderBy('report_at', 'desc')
				.paginate(1, 10)
		).toJSON()

		console.log('data >> ', data.data)

		let result = []

		for (const obj of data.data) {
			if (obj.unit) {
				const site = await MasSite.query().where('id', obj.unit.site_id).last()
				result.push({ ...obj, kd_site: site.kode, nm_site: site.name })
			} else {
				result.push(obj)
			}
		}

		return result
	}

	async SHOW_BY_DATE(params) {
		const shifts = (await MasShift.query().fetch()).toJSON()
		const date = moment(params.date).format('YYYY-MM-DD')

		const limit = parseInt(params.limit) || 100
		const halaman = params.page === undefined ? 1 : parseInt(params.page)

		for (const x of shifts) {
			let currentShiftStart = moment(`${date} ${x.start_shift}`).format('YYYY-MM-DD HH:mm:ss')
			let currentShiftEnd = moment(`${date} ${x.start_shift}`).add(x.duration, 'hour').format('YYYY-MM-DD HH:mm:ss')

			const currentDate = moment(params.date).format('YYYY-MM-DD HH:mm:ss')

			const hour_check_1 = moment(params.date).format('HH:mm')
			const hour_check_2 = moment(currentShiftEnd).format('HH:mm')

			const day_check_1 = moment(params.date).format('DD')
			const day_check_2 = moment(currentShiftEnd).format('DD')

			if (day_check_1 !== day_check_2 && hour_check_1 === hour_check_2) {
				currentShiftStart = moment(`${currentShiftStart}`)
					.subtract(x.duration * shifts.length, 'hour')
					.format('YYYY-MM-DD HH:mm:ss')

				currentShiftEnd = moment(`${date} ${x.start_shift}`).subtract(x.duration, 'hour').subtract(1, 'minutes').format('YYYY-MM-DD HH:mm:ss')
			}

			if (new Date(currentDate) >= new Date(currentShiftStart) && new Date(currentDate) <= new Date(currentShiftEnd)) {
				let hours = Array.from({ length: x.duration + 1 }, (a, y) => {
					return moment(`${date} ${x.start_shift}`)
						.add(60 * y, 'minutes')
						.format('YYYY-MM-DD HH:mm:ss')
				})

				let hoursArr = []
				for (let i = 1; i < hours.length; i++) {
					const obj = {
						data: {
							start: moment(hours[i]).subtract(1, 'hour').subtract(1, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
							end: moment(hours[i]).subtract(2, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
						},
					}
					hoursArr.push(obj)
				}

				let result = []
				let data = (
					await Issue.query()
						.with('user')
						.with('dailyevent', (w) => w.with('event'))
						.with('unit')
						.where('report_at', '>=', currentShiftStart)
						.andWhere('report_at', '<=', currentShiftEnd)
						.orderBy('report_at', 'desc')
						.fetch()
				).toJSON()

				for (const y of hoursArr) {
					const objData = {
						hourStart: y.data.start,
						hourEnd: y.data.end,
						data: data.filter((v) => new Date(v.report_at) >= new Date(y.data.start) && new Date(v.report_at) <= new Date(y.data.end)),
					}
					result.push(objData)
				}
				return result
				// data.arrUnit = data.unit.map(el => el.id)
			}
		}
	}

	async SHOW_LOG_HOURLY(req) {
		const { pit_id, start_at, end_at } = req

		const data = (
			await Issue.query()
				.with('user')
				.with('dailyevent', (w) => w.with('event'))
				.with('unit')
				.where((w) => {
					w.where('pit_id', pit_id)
					w.where('report_at', '>=', moment(start_at).format('YYYY-MM-DD HH:mm:ss'))
					w.where('report_at', '<=', moment(end_at).format('YYYY-MM-DD HH:mm:ss'))
				})
				.orderBy('report_at', 'asc')
				.fetch()
		).toJSON()

		let result = []
		for (const value of data) {
			// create the obj
			const eventName = value.dailyevent.event.narasi
			if (eventName === 'Rain' || eventName === 'Slippery' || eventName === 'Fog') {
				const hour_start = value.report_at ? moment(value.report_at).format('HH:mm') : null
				const hour_end = value.end_at ? moment(value.end_at).format('HH:mm') : null
				const txtOngoing = `${hour_start} = ${eventName} (Ongoing)`
				const txtStopped = `${hour_start} : ${hour_end} = ${eventName} (Stopped)`

				if (!hour_end) {
					result.push(txtOngoing)
				} else {
					result.push(txtStopped)
				}
			}
		}
		const uniq = _.uniq(result)
		return uniq
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
				console.log('week array >> ', weekArray)
				if (weekArray.length > 0) {
					for (const week of weekArray) {
						console.log('week >> ', week)
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

						// if (issues.length > 0) {
						// 	console.log('issues >> ', issues)
						// 	for (const value of issues) {
						// 		const obj = {
						// 			date: moment(value.date).format('YYYY-MM-DD'),
						// 			desc: value.issue,
						// 			issue: value.event.narasi,
						// 			shift: value.shift.kode,
						// 			period: `${moment(value.start_at).format('DD/MM HH:mm')} - ${moment(value.end_at).format('DD/MM HH:mm')}`,
						// 			duration: `${value.duration} H`,
						// 			pitName: value.pit.name,
						// 			text: `${moment(value.start_at).format('DD/MM')} : ${value.pit.name} / ${value.event.narasi} / ${value.shift.kode} (${value.duration} H)`
						// 		}
						// 		weeklyReasonArr.push(obj)
						// 	}
						// } else {
						// 	console.log('run >> ', issues)
						// 	return weeklyReasonArr;
						// }
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

module.exports = new dailyIssue()
