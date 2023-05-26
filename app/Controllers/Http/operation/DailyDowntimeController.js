'use strict'

const Equipment = use('App/Models/MasEquipment')
const DailyDowntimeHelpers = use('App/Controllers/Http/Helpers/DailyDowntime')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const Helpers = use('Helpers')
const MasEquipment = use('App/Models/MasEquipment')
const fs = require('fs')
const _ = require('underscore')
const id = require('faker/lib/locales/id_ID')
const DowntimeActivity = use('App/Models/DowntimeActivity')
const MamWorkOrders = use('App/Models/MamWorkOrders')
const SysOption = use('App/Models/SysOption')
const DailyDowntimeEquipment = use('App/Models/DailyDowntimeEquipment')
const Database = use('Database')
const DailyChecklist = use('App/Models/DailyChecklist')

class ValidationError extends Error {
	constructor(message) {
		super(message) // (1)
		this.type = 'Validate' // (2)
	}
}
class DailyDowntimeController {
	async index({ view, auth, request }) {
		const req = request.all()
		const unit = (await Equipment.query().where('aktif', 'Y').fetch()).toJSON()
		const comp = await Database.from('sys_options').whereIn('group', ['COMPONENT', 'ALL']).where('status', 'Y').orderBy('urut')
		const bd_type = await Database.from('sys_options').whereIn('group', ['BD TYPE', 'ALL']).where('status', 'Y').orderBy('urut')
		const user = await userValidate(auth)
		const usr = (await auth.getUser()).toJSON()
		// const data = (await Equipment.query().where('aktif', 'Y').fetch()).toJSON()
		if (!user) {
			return view.render('401')
		}

		if (request.ajax()) {
			let Page = req.start == 0 ? 1 : req.start / req.length + 1
			// console.log('request>>', req)
			const downtime = DailyDowntimeEquipment.query()
			if (req.unit_number != 0) {
				downtime.where('equip_id', req.unit_number)
			}
			if (req.sts != 0) {
				downtime.where('status', req.sts)
			}
			if (req.bd_sts != 0) {
				downtime.where('downtime_status', req.bd_sts)
			}
			if (req.bd_type != 0) {
				downtime.where('bd_type', req.bd_type)
			}
			console.log(moment(req.start_t, 'DD/MM/YYYY').format('YYYY-MM-DD hh:mm:ss'))
			if (req.start_t) {
				downtime.where((w) => {
					w.where('breakdown_start', '>=', moment(req.start_t, 'DD/MM/YYYY').format('YYYY-MM-DD'))
					// w.orWhereNull('breakdown_finish')
				})
			}

			if (req.end_t) {
				downtime.where((e) => {
					e.where(Database.raw('DATE(breakdown_finish)'), '<=', moment(req.end_t, 'DD/MM/YYYY').format('YYYY-MM-DD'))
					e.orWhereNull('breakdown_finish')
				})
			}
			const list = (await downtime.with('equipment').with('wo').with('type_break').orderBy('breakdown_start', 'desc').paginate(Page, req.length)).toJSON()

			return {
				draw: req.draw,
				recordsTotal: list.total,
				recordsFiltered: list.total,
				data: list.data,
			}
		}
		return view.render('operation.daily-downtime-equipment.index', { unit, comp, bd_type, usr })
	}

	async create({ view }) {
		const unit = (await Equipment.query().where('aktif', 'Y').fetch()).toJSON()
		const comp = await Database.from('sys_options').whereIn('group', ['COMPONENT', 'ALL']).where('status', 'Y')
		const bd_type = await Database.from('sys_options').whereIn('group', ['BD TYPE', 'ALL']).where('status', 'Y').orderBy('urut')
		return view.render('operation.daily-downtime-equipment.create', { unit, comp, bd_type })
	}

	async uploadFile({ auth, params }) {
		// console.log(params.id)
		let search = await DailyDowntimeEquipment.query()
			.where('equip_id', params.id)
			.where((w) => {
				w.orWhereNull('breakdown_finish')
			})
			.first()
		// console.log(search.toJSON())

		if (search) {
			return {
				success: true,
				data: search.toJSON(),
			}
		}
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
		const req = request.all()

		if (req.type_input == 'form') {
			let unit = await Equipment.find(req.unit_number)
			let code = `${unit.kode}.${moment(req.start, 'DD/MM/YYYY HH.mm').format('X')}`
			let check = await DailyDowntimeEquipment.findBy('downtime_code', code)
			let tot_hours = req.end ? moment(req.end, 'DD/MM/YYYY HH.mm').diff(moment(req.start, 'DD/MM/YYYY HH.mm'), 'minutes') : 0
			// console.log(req)
			if (check) {
				check.merge({
					equip_id: unit.id,
					site_id: req.site_id,
					location: req.location ? req.location : '',
					problem_reported: req.problem,
					corrective_action: req.action,
					breakdown_start: moment(req.start, 'DD/MM/YYYY HH.mm').format('YYYY-MM-DD HH:mm:SS'),
					breakdown_finish: req.end ? moment(req.end, 'DD/MM/YYYY HH.mm').format('YYYY-MM-DD HH:mm:SS') : null,
					downtime_total: tot_hours,
					downtime_code: code,
					bd_type: req.bd_type,
					status: req.status,
					component_group: req.comp_group,
					downtime_status: req.downtime_code,
					urut: 99,
					hour_meter: req.hm,
					updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				})
				await check.save()
				return {
					success: true,
					type: 'success',
					message: 'Update Successfull',
				}
			} else {
				const Insert = await Database.table('daily_downtime_equipment').insert({
					equip_id: unit.id,
					site_id: req.site_id,
					location: req.location ? req.location : '',
					problem_reported: req.problem,
					corrective_action: req.action,
					breakdown_start: moment(req.start, 'DD/MM/YYYY HH.mm').format('YYYY-MM-DD HH:mm:SS'),
					breakdown_finish: req.end ? moment(req.end, 'DD/MM/YYYY HH.mm').format('YYYY-MM-DD HH:mm:SS') : null,
					downtime_total: tot_hours,
					downtime_code: code,
					bd_type: req.bd_type,
					status: req.status,
					component_group: req.comp_group,
					downtime_status: req.downtime_code,
					urut: 99,
					hour_meter: req.hm,
					created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				})

				if (Insert) {
					const wo = new MamWorkOrders()
					wo.code = 'WO-' + String(Math.round(Math.random(1000) * 1000)).padStart(5, '0')
					wo.desc = ''
					wo.correction = ''
					wo.pic = ''
					wo.sts = '0'
					wo.breakdown_code = code
					await wo.save()
				}

				return {
					success: true,
					type: 'success',
					message: 'Insert Successfull',
				}
			}
		} else {
			var unit = await MasEquipment.pair('id', 'kode')
			var option = await SysOption.query().whereIn('group', ['COMPONENT', 'ALL', 'BD TYPE']).pair('id', 'teks')
			const validationOptions = {
				types: ['application'],
				extname: ['xls', 'xlsx'],
			}
			const reqFile = request.file('daily_downtime_upload', validationOptions)._files[0]
			if (!['xls', 'xlsx'].includes(reqFile.extname)) {
				return {
					success: false,
					message: 'Ektensi file yang di pilih tidak sesuai',
				}
			}

			let aliasName
			if (reqFile) {
				aliasName = `${reqFile.clientName.split('.')[0]}-${moment().format('DDMMYYHHmmss')}.${reqFile.extname}`

				await reqFile.move(Helpers.publicPath(`/upload/`), {
					name: aliasName,
					overwrite: true,
				})

				if (!reqFile.moved()) {
					return reqFile.error()
				}

				var pathData = Helpers.publicPath(`/upload/`)
				var fileSource = `${pathData}${aliasName}`

				if (req.type_input == 'radio') {
					try {
						const xlsx = excelToJson({
							sourceFile: fileSource,
							sheets: ['Data'],
							header: { rows: 2 },
							columnToKey: {
								A: 'lokasi',
								B: 'code_unit',
								C: 'model',
								D: 'desc',
								E: 'date_bd',
								F: 'time_bd',
								G: 'date_ready',
								H: 'time_ready',
								K: 'hour_meter',
								L: 'status',
							},
						})

						var dataXL = xlsx[Object.keys(xlsx)[0]]

						for (const data of dataXL) {
							var id_unit = _.findKey(unit, function (e) {
								return e === data.code_unit.replace(' ', '')
							})

							let bd_start = `${moment(data.date_bd).add(8, 'h').format('YYYY-MM-DD')} ${moment(data.time_bd).add(3, 'm').format('HH:mm:SS')}`
							let bd_end = data.date_ready ? `${moment(data.date_ready).add(8, 'h').format('YYYY-MM-DD')} ${moment(data.time_ready).add(3, 'm').format('HH:mm:SS')}` : null
							let code = `${data.code_unit}.${moment(bd_start).format('X')}`
							let fixTime = data.date_ready ? moment(bd_end).diff(moment(bd_start), 'minutes', true) : 0
							if (!id_unit) {
								return {
									success: false,
									type: 'warning',
									message: data.code_unit + ' tidak ditemukan	.!',
								}
							}
							let check = await DailyDowntimeEquipment.query().where('equip_id', id_unit).where('breakdown_start', bd_start).orderBy('created_at', 'desc').first()
							if (check) {
								if (check.breakdown_finish != bd_end && bd_end != null) {
									const update = await DailyDowntimeEquipment.query().where('id', check.id).update({
										breakdown_finish: bd_end,
										downtime_total: fixTime,
										hour_meter: data.hour_meter,
										status: data.status,
									})
								}
							} else {
								const Insert = await Database.table('daily_downtime_equipment').insert({
									equip_id: id_unit,
									site_id: req.site_id,
									location: data.lokasi,
									problem_reported: data.desc,
									breakdown_start: bd_start,
									breakdown_finish: bd_end,
									downtime_total: fixTime,
									downtime_code: code,
									bd_type: 999,
									status: data.status,
									component_group: 999,
									downtime_status: '-',
									urut: 99,
									hour_meter: data.hour_meter,
									created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
								})

								if (Insert) {
									const wo = new MamWorkOrders()
									wo.code = 'WO-' + String(Insert[0]).padStart(5, '0')
									wo.desc = ''
									wo.correction = ''
									wo.pic = ''
									wo.sts = '0'
									wo.breakdown_code = code
									await wo.save()
								}
							}
						}

						return {
							success: true,
							type: 'warning',
							message: 'Data Berhasil di Update.!',
						}
					} catch (err) {
						return {
							success: false,
							message: 'Failed when uploading daily downtime, please try again. \n Reason : ',
							reason: err.message,
						}
					}
				} else if (req.type_input == 'plan') {
					try {
						const xlsx = excelToJson({
							sourceFile: fileSource,
							sheets: ['Data'],
							header: { rows: 2 },
							columnToKey: {
								A: 'code_unit',
								B: 'type_bd',
								C: 'model',
								D: 'location',
								E: 'HM',
								F: 'problem',
								G: 'action',
								H: 'date',
								I: 'start',
								J: 'end',
								K: 'total_time',
								L: 'status',
								M: 'comp_group',
								N: 'dt_code',
								O: 'PIC',
							},
						})

						var dataXL = xlsx[Object.keys(xlsx)[0]]

						for (const data of dataXL) {
							var id_unit = _.findKey(unit, function (e) {
								return e === data.code_unit.replace(' ', '')
							})

							let bd_start = `${moment(data.date).add(8, 'h').format('YYYY-MM-DD')} ${moment(data.start).add(3, 'm').format('HH:mm:SS')}`
							let bd_end = `${moment(data.date).add(8, 'h').format('YYYY-MM-DD')} ${moment(data.end).add(3, 'm').format('HH:mm:SS')}` || null

							if (!id_unit || !bd_start || !bd_end) {
								console.log('no data ', data.code_unit)
								continue
							}

							let check = await DailyDowntimeEquipment.query()
								.where('equip_id', id_unit)
								.where((e) => {
									e.where('breakdown_start', '<=', bd_start)
								})
								.where((e) => {
									e.where('breakdown_finish', '>=', bd_end)
									e.orWhereNull('breakdown_finish')
								})
								.orderBy('breakdown_start', 'desc')
								.first()
							if (check) {
								var bd_type = _.findKey(option, function (e) {
									return e === data.type_bd.replace(' ', '')
								})
								var comp_group = _.findKey(option, function (e) {
									return e === data.comp_group.replace(' ', '')
								})

								if (check.bd_type == bd_type && check.component_group == comp_group && check.downtime_status == data.dt_code) {
									continue
								}
								const update = await DailyDowntimeEquipment.query().where('id', check.id).update({
									bd_type: bd_type,
									component_group: comp_group,
									downtime_status: data.dt_code.toUpperCase(),
									person_in_charge: data.PIC,
								})

								let check_da = await DowntimeActivity.query()
									.where((e) => {
										e.where('downtime_code', check.downtime_code)
										e.where('start', bd_start)
										e.where('end', bd_end)
										e.where('comp_id', comp_group)
									})
									.first()

								// console.log('check', check_da)
								if (!check_da) {
									const Insert = await Database.table('downtime_activity').insert({
										downtime_code: check.downtime_code,
										activity: data.action,
										start: bd_start,
										end: bd_end,
										comp_id: comp_group,
										sts: data.status == 'RFU' ? 'Y' : 'N',
									})
								}
							} else {
								console.log(id_unit, bd_start, bd_end, data.code_unit)
							}
						}
						return {
							success: false,
							type: 'warning',
							message: 'Data Berhasil di Update.!',
						}
					} catch (err) {
						console.log(err)
						return {
							success: false,
							message: 'Failed when uploading daily downtime, please try again. \n Reason : ',
							reason: err.message,
						}
					}
				}
			} else {
				return {
					success: false,
					message: 'Gagal mengupload file Daily Downtime ..., silahkan coba lagi',
				}
			}
		}
	}

	async list({ auth, request, view }) {
		const req = request.all()
		const user = await userValidate(auth)
		if (!user) {
			return view.render('401')
		}
		const data = await DailyDowntimeHelpers.LIST(req)
		return view.render('operation.daily-downtime-equipment.list', { list: data })
	}
}

module.exports = DailyDowntimeController

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
