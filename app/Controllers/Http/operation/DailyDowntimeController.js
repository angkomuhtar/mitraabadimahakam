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
	async index({ view }) {
		const data = (await Equipment.query().where('aktif', 'Y').fetch()).toJSON()
		return view.render('operation.daily-downtime-equipment.index', { equip: data })
	}

	async create({ view }) {
		const unit = (await Equipment.query().where('aktif', 'Y').fetch()).toJSON()
		const comp = await Database.from('sys_options').whereIn('group', ['COMPONENT', 'ALL']).where('status', 'Y')
		const bd_type = await Database.from('sys_options').whereIn('group', ['BD TYPE', 'ALL']).where('status', 'Y').orderBy('urut')
		return view.render('operation.daily-downtime-equipment.create', { unit, comp, bd_type })
	}

	async uploadFile({ auth, request }) {
		const validateFile = {
			types: ['pdf'],
			types: 'application',
		}
		const reqFile = request.file('daily_downtime_upload', validateFile)

		// if (!reqFile.extname.includes('xlsx')) {
		// 	return {
		// 		success: false,
		// 		message: 'Tipe file yang di upload harus xls / xlsx !',
		// 	}
		// }

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

			const convertJSON = excelToJson({
				sourceFile: `${pathData}${aliasName}`,
				header: {
					rows: 4,
				},
			})

			var arr = Object.keys(convertJSON).map(function (key) {
				return key
			})

			return {
				title: arr,
				data: [],
				fileName: aliasName,
			}
		} else {
			return {
				success: false,
				message: 'Gagal mengupload file Daily Downtime ..., silahkan coba lagi',
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

		// let user = null
		// try {
		// 	user = await auth.getUser()
		// } catch (err) {
		// 	return {
		// 		error: true,
		// 		message: err.message,
		// 		validation: 'You are not authorized !',
		// 	}
		// }

		// const fileName = req.current_file_name ? JSON.parse(req.current_file_name) : false

		// var pathData = Helpers.publicPath(`/upload/`)
		// const filePath = `${pathData}${fileName}`
		// var unit = await MasEquipment.pair('id', 'kode')

		// if (req.tipe && req.tipe === 'downtime') {
		// 	try {
		// 		const xlsx = excelToJson({
		// 			sourceFile: filePath,
		// 			sheets: ['Data'],
		// 			header: { rows: 1 },
		// 			columnToKey: {
		// 				B: 'lokasi',
		// 				C: 'code_unit',
		// 				E: 'desc',
		// 				F: 'start_date',
		// 				G: 'start_time',
		// 				H: 'end_date',
		// 				I: 'end_time',
		// 				J: 'total_jam_rusak',
		// 				K: 'total_jam_rusak_shift',
		// 				M: 'status',
		// 				O: 'hm_num',
		// 				P: 'shift',
		// 			},
		// 		})
		// 		var dataXL = xlsx[Object.keys(xlsx)[0]]
		// 		let data_input = []
		// 		console.log(dataXL.length)

		// 		for (const data of dataXL) {
		// 			var id_unit = _.findKey(unit, function (e) {
		// 				return e === data.code_unit.replace(' ', '')
		// 			})
		// 			let date_time_start = `${moment(data.start_date).add(1, 'days').format('YYYY-MM-DD')} ${moment(data.start_time).add(3, 'm').format('HH:mm:ss')}`
		// 			let date_time_fix = data.end_date ? `${moment(data.end_date).add(1, 'days').format('YYYY-MM-DD')} ${moment(data.end_time).add(3, 'm').format('HH:mm:ss')}` : null
		// 			// let date_time_start = moment(`${data.start_date} ${data.start_time}`, '')
		// 			let code = `${data.code_unit}.${moment(date_time_start).format('X')}`
		// 			let fixTime = moment(date_time_fix).diff(moment(date_time_start), 'minutes', true)

		// 			if (!id_unit) {
		// 				return {
		// 					success: false,
		// 					type: 'warning',
		// 					message: data.code_unit + ' tidak ditemukan	.!',
		// 				}
		// 			}
		// 			console.log(id_unit, data.code_unit)
		// 			const cek = await DailyDowntimeEquipment.findBy('downtime_code', code)
		// 			if (cek) {
		// 				// const downtime = new DailyDowntimeEquipment()
		// 				cek.merge({
		// 					equip_id: id_unit,
		// 					site_id: req.site_id,
		// 					location: data.lokasi,
		// 					problem_reported: data.desc,
		// 					breakdown_start: date_time_start,
		// 					breakdown_finish: date_time_fix,
		// 					downtime_total: isNaN(fixTime) ? 0 : fixTime,
		// 					downtime_code: code,
		// 					status: data.status.toUpperCase(),
		// 					urut: 1,
		// 					hour_meter: data.hm_num,
		// 				})
		// 				await cek.save()
		// 			} else {
		// 				const Insert = await DailyDowntimeEquipment.findOrCreate({
		// 					equip_id: id_unit,
		// 					site_id: req.site_id,
		// 					location: data.lokasi,
		// 					problem_reported: data.desc,
		// 					breakdown_start: date_time_start,
		// 					breakdown_finish: date_time_fix,
		// 					downtime_total: isNaN(fixTime) ? 0 : fixTime,
		// 					downtime_code: code,
		// 					status: data.status.toUpperCase(),
		// 					urut: 1,
		// 					hour_meter: data.hm_num,
		// 				})
		// 			}
		// 		}
		// 		// if (data_input.length == 0) {
		// 		return {
		// 			success: false,
		// 			type: 'warning',
		// 			message: 'Data Berhasil di Update.!',
		// 		}
		// 	} catch (err) {
		// 		return {
		// 			success: false,
		// 			message: 'Failed when uploading daily downtime, please try again. \n Reason : ',
		// 			reason: err.message,
		// 		}
		// 	}
		// } else {
		// 	// Equipment's Hour Meter Upload
		// 	try {
		// 		const xlsx = excelToJson({
		// 			sourceFile: filePath,
		// 			header: { rows: 1 },
		// 			sheets: ['Data'],
		// 			columnToKey: {
		// 				B: 'date',
		// 				C: 'shift',
		// 				D: 'id_number',
		// 				I: 'start_smu',
		// 				J: 'end_smu',
		// 			},
		// 		})

		// 		var dataX = xlsx[Object.keys(xlsx)[0]]
		// 		console.log(dataX)
		// 		var inputData = []

		// 		for (const data of dataX) {
		// 			console.log(data.start_smu)

		// 			if (data.start_smu) {
		// 				var key = _.findKey(unit, function (e) {
		// 					return e === data.id_number.replace(' ', '')
		// 				})
		// 				if (!key) {
		// 					return {
		// 						success: false,
		// 						type: 'warning',
		// 						message: `kode equipment ${data.id_number} tidak ditemukan`,
		// 					}
		// 				}
		// 				var date = moment(data.date).add(8, 'hours').format('YYYY-MM-DD')

		// 				console.log(date, key, data.shift == 'DS' ? 1 : 2)
		// 				var check = await DailyChecklist.query()
		// 					.where((trx) => {
		// 						trx.where('tgl', date)
		// 						trx.where('unit_id', key)
		// 						trx.where('shift_id', data.shift == 'DS' ? 1 : 2)
		// 					})
		// 					.first()
		// 				var test = {
		// 					user_chk: user.id,
		// 					unit_id: key,
		// 					shift_id: data.shift == 'DS' ? 1 : 2,
		// 					tgl: date,
		// 					description: 'hm upload from daily downtime',
		// 					begin_smu: data.start_smu,
		// 					end_smu: data.end_smu,
		// 					used_smu: parseFloat(data.end_smu - data.start_smu).toFixed(2),
		// 					approved_at: data.shift == 'DS' ? date + ' 07:01:00' : date + ' 19:01:00',
		// 					finish_at: data.shift == 'DS' ? date + ' 19:00:00' : moment(date).add(1, 'days').format('YYYY-MM-DD') + ' 07:00:00',
		// 					created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
		// 				}

		// 				// duplicate data will update
		// 				if (check) {
		// 					// check.merge(test)
		// 					// await check.save()
		// 				} else {
		// 					inputData.push(test)
		// 				}
		// 			}
		// 		}

		// 		const trx = await Database.beginTransaction()
		// 		const insertData = await trx.insert(inputData).into('daily_checklists')
		// 		if (insertData) {
		// 			trx.commit()
		// 			fs.unlink(filePath, (err) => {
		// 				if (err) {
		// 					console.log(`failed when deleting ${filePath} file`)
		// 				}
		// 				console.log(`${filePath} is deleted from directory`)
		// 			})
		// 			return {
		// 				success: true,
		// 				message: inputData.length + ' row data has been imported',
		// 			}
		// 		} else {
		// 			trx.rollback()
		// 		}
		// 		return {
		// 			success: false,
		// 			type: 'warning',
		// 			message: 'semua data telah diinput sebelumnya, pastikan data tgl dan data benar.!',
		// 		}
		// 	} catch (err) {
		// 		return {
		// 			success: false,
		// 			message: 'Failed when uploading daily hour meter, please try again.',
		// 			reason: err.message,
		// 		}
		// 	}
		// }
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
