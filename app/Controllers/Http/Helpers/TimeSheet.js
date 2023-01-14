'use strict'

const db = use('Database')
const MasP2H = use('App/Models/MasP2H')
const DailyEvent = use('App/Models/DailyEvent')
const DailyFleet = use('App/Models/DailyFleet')
const DailyCheckp2H = use('App/Models/DailyCheckp2H')
const DailyRefueling = use('App/Models/DailyRefueling')
const DailyChecklist = use('App/Models/DailyChecklist')

class TimeSheet {
	async ALL(req) {
		console.log('req', req)
		const limit = 25
		const halaman = req.page === undefined ? 1 : parseInt(req.page)
		let dailyChecklist
		if (req.keyword) {
			dailyChecklist = await DailyChecklist.query()
				.with('dailyFleet', (d) => {
					d.with('fleet')
					d.with('pit')
					d.with('activities')
					d.with('shift')
				})
				.with('shift')
				.with('userCheck')
				.with('spv')
				.with('lead')
				.with('equipment')
				.with('p2h')
				.with('dailyEvent')
				.where((w) => {
					w.where('description', 'like', `%${req.keyword}%`).orWhere('tgl', 'like', `${req.keyword}`)
				})
				.orderBy('tgl', 'desc')
				.paginate(halaman, limit)
		} else {
			dailyChecklist = await DailyChecklist.query()
				.with('dailyFleet', (d) => {
					d.with('fleet')
					d.with('pit')
					d.with('activities')
					d.with('shift')
				})
				.with('userCheck')
				.with('spv')
				.with('lead')
				.with('shift')
				.with('operator_unit')
				.with('equipment')
				.with('p2h')
				.with('dailyEvent')
				.orderBy('tgl', 'desc')
				.paginate(halaman, limit)
		}
		return dailyChecklist
	}

	async GET_ID(params) {
		// const dailyChecklist = await DailyChecklist.findOrFail(params.id)
		const dailyChecklist = await DailyChecklist.query()
			.with('dailyFleet', (d) => {
				d.with('fleet')
				d.with('pit')
				d.with('activities')
				d.with('shift')
			})
			.with('userCheck', (u) => u.with('profile'))
			.with('spv', (u) => u.with('profile'))
			.with('lead')
			.with('operator_unit')
			.with('equipment')
			.with('p2h')
			.with('dailyEvent')
			.with('dailyRefueling')
			.where('id', params.id)
			.first()
		return dailyChecklist
	}

	async UPDATE(params, req) {
		// console.log('TimeSheet ::', req);
		const trx = await db.beginTransaction()
		try {
			const { p2h, event } = req
			const dailyChecklist = await DailyChecklist.find(params.id)

			const dataMerge = {
				user_chk: req.user_chk,
				user_spv: req.user_spv,
				operator: req.operator,
				unit_id: req.unit_id,
				tgl: req.tgl,
				approved_at: req.approved_at,
				finish_at: req.finish_at,
				dailyfleet_id: req.dailyfleet_id,
				description: req.description,
				begin_smu: dailyChecklist.begin_smu,
				end_smu: req.end_smu,
			}

			dailyChecklist.merge(dataMerge)
			await dailyChecklist.save(trx)

			// let dailyRefueling = await DailyRefueling.query().where({timesheet_id: params.id, equip_id: refueling.equip_id}).first()
			// if(dailyRefueling){
			//     dailyRefueling.merge(refueling)
			// }else{
			//     dailyRefueling = new DailyRefueling()
			//     dailyRefueling.fill(refueling)
			// }
			// await dailyRefueling.save(trx)

			await dailyChecklist.p2h().detach(null, null, trx)
			let arrP2H = []
			for (const item of p2h) {
				let p2h_item = await MasP2H.findOrFail(item.p2h_id)
				arrP2H.push({
					checklist_id: dailyChecklist.id,
					p2h_id: p2h_item.id,
					is_check: item.is_check,
					description: item.description,
				})
			}
			await DailyCheckp2H.createMany(arrP2H, trx)

			let arrEventRemove = (await DailyEvent.query().where('timesheet_id', params.id).fetch()).toJSON()

			for (const itemRem of arrEventRemove) {
				const exEvent = await DailyEvent.query().where('id', itemRem.id).last()
				await exEvent.delete()
			}

			console.log('arrEventRemove', arrEventRemove)
			for (const item of event) {
				const dataEvent = new DailyEvent()
				dataEvent.fill({
					start_at: item.start_at,
					end_at: item.end_at || null,
					user_id: item.user_id,
					event_id: item.event_id,
					description: item.description,
					timesheet_id: item.timesheet_id,
					equip_id: item.equip_id,
				})
				await dataEvent.save(trx)
			}

			await trx.commit(trx)

			return await DailyChecklist.query()
				.with('userCheck')
				.with('spv')
				.with('lead')
				.with('operator_unit')
				.with('equipment', (a) => {
					a.with('daily_smu', (whe) => whe.limit(10).orderBy('id', 'desc'))
				})
				.with('dailyFleet', (b) => {
					b.with('pit')
					b.with('fleet')
					b.with('activities')
					b.with('shift')
				})
				.with('p2h')
				.with('dailyEvent')
				.where({ id: params.id })
				.first()
		} catch (error) {
			console.log(error)
			await trx.rollback(trx)
			return error.message
		}
	}

	async POST(req, user) {
		const dailyFleet = await DailyFleet.query()
			.where((w) => {
				w.where('date', req.tgl)
				w.where('pit_id', req.pit_id)
				w.where('shift_id', req.shift_id)
				w.where('activity_id', req.activity_id)
			})
			.last()

		console.log(req)
		if (!dailyFleet) {
			return {
				success: false,
				message: 'Daily Fleet tidak ditemukan...',
			}
		}

		const dailyChecklist = new DailyChecklist()

		try {
			dailyChecklist.fill({
				dailyfleet_id: dailyFleet.id,
				user_chk: user.id || null,
				user_spv: req.spv_id,
				operator: req.operator,
				unit_id: req.unit_id,
				tgl: req.tgl,
				description: req.description,
				begin_smu: req.begin_smu,
				end_smu: req.end_smu || 0.0,
				used_smu: req.end_smu ? parseFloat(req.end_smu) - parseFloat(req.begin_smu) : 0.0,
				approved_at: new Date(),
			})

			await dailyChecklist.save()
			return {
				success: true,
				message: 'Success save data...',
			}
		} catch (error) {
			console.log(error)
			return {
				success: false,
				message: 'Failed save data...',
			}
		}
	}
}

module.exports = new TimeSheet()
