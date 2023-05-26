'use strict'

const Equipment = use('App/Models/MasEquipment')
const DailyDowntimeHelpers = use('App/Controllers/Http/Helpers/DailyDowntime')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const Helpers = use('Helpers')
const MasEquipment = use('App/Models/MasEquipment')
const fs = require('fs')
const _ = require('underscore')
const SysOption = use('App/Models/SysOption')
const DowntimeActivity = use('App/Models/DowntimeActivity')
const DailyDowntimeEquipment = use('App/Models/DailyDowntimeEquipment')
const Database = use('Database')
const DailyChecklist = use('App/Models/DailyChecklist')

class ValidationError extends Error {
	constructor(message) {
		super(message) // (1)
		this.type = 'Validate' // (2)
	}
}
class DowntimeActivityController {
	async index({ auth, request, view }) {
		const req = request.all()
		const unit = (await Equipment.query().where('aktif', 'Y').fetch()).toJSON()
		const comp = await Database.from('sys_options').whereIn('group', ['COMPONENT', 'ALL']).where('status', 'Y').orderBy('urut')
		const bd_type = await Database.from('sys_options').whereIn('group', ['BD TYPE', 'ALL']).where('status', 'Y').orderBy('urut')
		const user = await userValidate(auth)
		if (!user) {
			return view.render('401')
		}

		if (request.ajax()) {
			console.log('request>>', req)
			let Page = req.start == 0 ? 1 : req.start / req.length + 1
			const downtime = DowntimeActivity.query()
			if (req.unit_number != 0) {
				downtime.whereHas('downtime', (query) => {
					query.where('equip_id', req.unit_number)
				})
			}
			if (req.comp != 0) {
				downtime.where('component_group', req.comp)
			}
			// if (req.bd_type != 0) {
			// 	downtime.where('bd_type', req.bd_type)
			// }
			const list = (
				await downtime
					.with('downtime', (w) => {
						w.with('equipment')
					})
					.with('comp_group')
					.orderBy('created_at', 'desc')
					.paginate(Page, req.length)
			).toJSON()

			console.log(list.data)
			return {
				draw: req.draw,
				recordsTotal: list.total,
				recordsFiltered: list.total,
				data: list.data,
			}
		}

		return view.render('operation.downtime-activity.index', { unit, comp, bd_type })
	}

	async create({ params, view }) {
		const { code } = params
		let downtime = (await DailyDowntimeEquipment.query().where('downtime_code', code).with('equipment').first()).toJSON()
		let act = (await DowntimeActivity.query().where('downtime_code', code).with('comp_group').orderBy('start', 'desc').fetch()).toJSON()
		let activity = act.map((data) => {
			return {
				...data,
				start_f: moment(data.start).format('DD-MM-YYYY HH:mm:SS'),
				end_f: moment(data.end).format('DD-MM-YYYY HH:mm:SS'),
			}
		})
		const comp = await Database.from('sys_options').whereIn('group', ['COMPONENT', 'ALL']).where('status', 'Y')
		const bd_type = await Database.from('sys_options').whereIn('group', ['BD TYPE', 'ALL']).where('status', 'Y').orderBy('urut')
		return view.render('operation.downtime-activity.create', { downtime, comp, bd_type, code, activity })
	}

	async store({ request, auth }) {
		let user = null
		try {
			user = await auth.getUser()
		} catch (err) {
			return {
				error: true,
				message: err.message,
				validation: 'You are not authorized !',
			}
		}
		const { dt_code, mulai, selesai, activity, comp_group, status } = request.all()
		const da = new DowntimeActivity()
		da.downtime_code = dt_code
		da.activity = activity
		da.start = moment(mulai, 'DD-MM-YYYY HH.mm').format('YYYY-MM-DD HH:mm')
		da.end = moment(selesai, 'DD-MM-YYYY HH.mm').format('YYYY-MM-DD HH:mm')
		da.comp_id = comp_group
		da.sts = status

		try {
			await da.save()
			return {
				success: true,
				type: 'success',
				message: 'Insert Successfull',
			}
		} catch (error) {
			return {
				success: false,
				type: 'error',
				message: 'Error when insert',
			}
		}
	}

	async code({ params }) {
		try {
			let now = moment().format('YYYY-MM-DD')
			const { id } = params
			console.log(id, now)
			let search = await DailyDowntimeEquipment.query()
				.where('equip_id', id)
				.where((w) => {
					w.orWhereNull('breakdown_finish')
					w.orWhere(Database.raw('DATE(breakdown_finish)'), now)
				})
				.first()
			if (search) {
				return {
					success: true,
					msg: 'data ditemukan',
					data: search.toJSON(),
				}
			} else {
				return {
					success: false,
					msg: 'downtime untuk nomor unit terpilih tidak ditemukan',
				}
			}
		} catch (error) {
			return {
				success: false,
				msg: error.msg,
			}
		}
	}
}

module.exports = DowntimeActivityController

async function userValidate(auth) {
	let user
	try {
		user = await auth.getUser()
		return user
	} catch (error) {
		console.log(error)
		return null
	}
}
