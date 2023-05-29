'use strict'

const Equipment = use('App/Models/MasEquipment')
const DailyDowntimeHelpers = use('App/Controllers/Http/Helpers/DailyDowntime')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const Helpers = use('Helpers')
const MasEquipment = use('App/Models/MasEquipment')
const fs = require('fs')
const _ = require('underscore')
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
class WorkOrdersController {
	async index({ view, auth, request }) {
		const req = request.all()
		const unit = (await Equipment.query().where('aktif', 'Y').fetch()).toJSON()
		const comp = await Database.from('sys_options').whereIn('group', ['COMPONENT', 'ALL']).where('status', 'Y').orderBy('urut')
		const bd_type = await Database.from('sys_options').whereIn('group', ['BD TYPE', 'ALL']).where('status', 'Y').orderBy('urut')
		const user = await userValidate(auth)
		// const data = (await Equipment.query().where('aktif', 'Y').fetch()).toJSON()
		if (!user) {
			return view.render('401')
		}

		if (request.ajax()) {
			let Page = req.start == 0 ? 1 : req.start / req.length + 1
			console.log('request>>', req, Page, req.start)
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

			if (req.start_t) {
				downtime.where((w) => {
					w.where('breakdown_start', '>=', moment(req.start_t, 'DD/MM/YYYY').format('YYYY-MM-DD'))
					w.orWhereNull('breakdown_finish')
				})
			}

			if (req.end_t) {
				downtime.where((e) => {
					e.where(Database.raw('DATE(breakdown_finish)'), '<=', moment(req.end_t, 'DD/MM/YYYY').format('YYYY-MM-DD'))
					e.orWhereNull('breakdown_finish')
				})
			}
			const list = (await downtime.with('equipment').with('wo').with('type_break').orderBy('created_at', 'desc').paginate(Page, req.length)).toJSON()

			return {
				draw: req.draw,
				recordsTotal: list.total,
				recordsFiltered: list.total,
				data: list.data,
			}
		}
		return view.render('operation.daily-downtime-equipment.index', { unit, comp, bd_type })
	}

	async show({ view, params }) {
		const unit = (await Equipment.query().where('aktif', 'Y').fetch()).toJSON()
		const comp = await Database.from('sys_options').whereIn('group', ['COMPONENT', 'ALL']).where('status', 'Y')
		const bd_type = await Database.from('sys_options').whereIn('group', ['BD TYPE', 'ALL']).where('status', 'Y').orderBy('urut')

		let code = params.id
		let wo = (
			await MamWorkOrders.query()
				.where('code', code)
				.with('breakdown', (w) => {
					w.with('equipment')
				})
				.first()
		).toJSON()
		wo = {
			...wo,
			breakdown: {
				...wo.breakdown,
				breakdown_time: moment(wo.breakdown_start).format('DD-MM-YYYY HH:mm'),
			},
		}
		console.log(wo)
		return view.render('operation.work-orders.show', { unit, comp, bd_type, wo })
	}

	async uploadFile({ auth, params }) {
		console.log(params.id)
		let search = await DailyDowntimeEquipment.query()
			.where('equip_id', params.id)
			.where((w) => {
				w.orWhereNull('breakdown_finish')
			})
			.first()
		console.log(search.toJSON())

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
			console.log(req)
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
				// transaction for create WO
				// const trx = await Database.beginTransaction()
				// let wo = await MamWorkOrders.create({ code: 'virk', order_number: 123 }, trx)
				// console.log(wo)
				// return

				// end
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
					wo.code = 'WO-001'
					wo.desc = ''
					wo.correction = ''
					wo.pic = ''
					wo.sts = '0'
					wo.bd_code = code
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
			var option = await SysOption.pair('id', 'teks')
			const validationOptions = {
				types: ['application'],
				extname: ['xls', 'xlsx'],
			}
			const reqFile = request.file('daily_downtime_upload', validationOptions)._files[0]
			console.log(reqFile.extname)

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

				try {
					const xlsx = excelToJson({
						sourceFile: fileSource,
						sheets: ['Data'],
						header: { rows: 2 },
						columnToKey: {
							A: 'code_unit',
							B: 'bd_type',
							C: 'model',
							D: 'lokasi',
							E: 'hm_num',
							F: 'desc',
							G: 'action',
							H: 'start_time',
							I: 'end_time',
							J: 'total',
							K: 'status',
							L: 'comp_group',
							M: 'downtime_code',
						},
					})
					var dataXL = xlsx[Object.keys(xlsx)[0]]
					let data_input = []

					for (const data of dataXL) {
						var id_unit = _.findKey(unit, function (e) {
							return e === data.code_unit.replace(' ', '')
						})

						var comp = data?.comp_group
							? _.findKey(option, function (e) {
									return e === data.comp_group.replace(' ', '')
							  })
							: ''

						var bd_type = data?.bd_type
							? _.findKey(option, function (e) {
									return e === data.bd_type.replace(' ', '')
							  })
							: ''

						console.log(bd_type)
						let date_time_start = moment(data.start_time).add(1, 'minute').format('YYYY-MM-DD HH:mm')
						let date_time_fix = data.end_time ? moment(data.end_time).add(1, 'minute').format('YYYY-MM-DD HH:mm') : null
						let code = `${data.code_unit}.${moment(date_time_start).format('X')}`
						let fixTime = data.end_time ? moment(date_time_fix).diff(moment(date_time_start), 'minutes', true) : 0
						if (!id_unit) {
							return {
								success: false,
								type: 'warning',
								message: data.code_unit + ' tidak ditemukan	.!',
							}
						}
						const cek = await DailyDowntimeEquipment.findBy('downtime_code', code)
						console.log({
							equip_id: id_unit,
							site_id: req.site_id,
							location: data.lokasi | null,
							problem_reported: data.desc,
							corrective_action: data?.action | null,
							breakdown_start: date_time_start,
							breakdown_finish: date_time_fix,
							downtime_total: fixTime,
							downtime_code: code,
							bd_type: bd_type | null,
							status: data.status,
							component_group: comp | null,
							downtime_status: data.downtime_code,
							urut: 1,
							hour_meter: req.hm | 0,
						})
						if (cek) {
							// const downtime = new DailyDowntimeEquipment()
							cek.merge({
								equip_id: id_unit,
								site_id: req.site_id,
								location: data.lokasi | null,
								problem_reported: data.desc,
								corrective_action: data?.action | '',
								breakdown_start: date_time_start,
								breakdown_finish: date_time_fix,
								downtime_total: fixTime,
								downtime_code: code,
								bd_type: bd_type | '',
								status: data.status,
								component_group: comp | '',
								downtime_status: data.downtime_code,
								urut: 1,
								hour_meter: req.hm | 0,
							})
							await cek.save()
						} else {
							const Insert = await DailyDowntimeEquipment.findOrCreate({
								equip_id: id_unit,
								site_id: req.site_id,
								location: data.lokasi | null,
								problem_reported: data.desc,
								corrective_action: data?.action | '',
								breakdown_start: date_time_start,
								breakdown_finish: date_time_fix,
								downtime_total: fixTime,
								downtime_code: code,
								bd_type: bd_type | '',
								status: data.status,
								component_group: comp | '',
								downtime_status: data.downtime_code,
								urut: 1,
								hour_meter: req.hm | 0,
							})
						}
					}
					// if (data_input.length == 0) {
					return {
						success: false,
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

module.exports = WorkOrdersController

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