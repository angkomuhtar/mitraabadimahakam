'use strict'

const Equipment = use('App/Models/MasEquipment')
const DailyDowntimeHelpers = use('App/Controllers/Http/Helpers/DailyDowntime')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const Helpers = use('Helpers')
const MasEquipment = use('App/Models/MasEquipment')
const fs = require('fs')
const _ = require('underscore')
const Database = use('Database')
const DailyChecklist = use('App/Models/DailyChecklist')

class DailyDowntimeController {
	async index({ view }) {
		const data = (await Equipment.query().where('aktif', 'Y').fetch()).toJSON()
		return view.render('operation.daily-downtime-equipment.index', { equip: data })
	}

	async create({ view }) {
		return view.render('operation.daily-downtime-equipment.create')
	}

	async uploadFile({ auth, request }) {
		const validateFile = {
			types: ['pdf'],
			types: 'application',
		}

		const reqFile = request.file('daily_downtime_upload', validateFile)

		if (!reqFile.extname.includes('xlsx')) {
			return {
				success: false,
				message: 'Tipe file yang di upload harus xls / xlsx !',
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
		const req = request.all()

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

		const fileName = req.current_file_name ? JSON.parse(req.current_file_name) : false

		var pathData = Helpers.publicPath(`/upload/`)
		const filePath = `${pathData}${fileName}`

		if (req.tipe && req.tipe === 'downtime') {
			try {
				const { success, message } = await DailyDowntimeHelpers.uploadProcessActivity(req, filePath, user)

				if (success) {
					fs.unlink(filePath, (err) => {
						if (err) {
							console.log(`failed when deleting ${filePath} file`)
						}
						console.log(`${filePath} is deleted from directory`)
					})
				}
				return {
					success,
					message,
				}
			} catch (err) {
				return {
					success: false,
					message: 'Failed when uploading daily downtime, please try again. \n Reason : ' + err.message,
					reason: err.message,
				}
			}
		} else {
			// Equipment's Hour Meter Upload
			try {
				const xlsx = excelToJson({
					sourceFile: filePath,
					header: { rows: 2 },
					sheets: [req.sheet],
					columnToKey: {
						B: 'date',
						C: 'shift',
						D: 'id_number',
						I: 'start_smu',
						J: 'end_smu',
					},
				})

				var data = xlsx[Object.keys(xlsx)[0]]
				//  remove blanks
				var Xdata = _.reject(data, (e) => {
					return e.id_number == ''
				})
				var unit = await MasEquipment.pair('id', 'kode')
				var inputData = []

				for (const data of Xdata) {
					var key =
						_.findKey(unit, function (e) {
							return e === data.id_number
						}) ||
						_.findKey(unit, function (e) {
							return e === data.id_number.replace(' ', '')
						})
					var date = moment(data.date).add(8, 'hours').format('YYYY-MM-DD')
					var check = await DailyChecklist.query()
						.where((trx) => {
							trx.where('tgl', date)
							trx.where('unit_id', key)
							trx.where('shift_id', data.shift == 'DS' ? 1 : 2)
						})
						.first()
					var test = {
						user_chk: user.id,
						unit_id: key,
						shift_id: data.shift == 'DS' ? 1 : 2,
						tgl: date,
						description: 'hm upload from daily downtime',
						begin_smu: data.start_smu,
						end_smu: data.end_smu,
						used_smu: parseFloat(data.end_smu - data.start_smu).toFixed(2),
						approved_at: data.shift == 'DS' ? date + ' 07:01:00' : date + ' 19:01:00',
						finish_at: data.shift == 'DS' ? date + ' 19:00:00' : moment(date).add(1, 'days').format('YYYY-MM-DD') + ' 07:00:00',
						created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
					}

					// duplicate data will update
					if (check) {
						// check.merge(test)
						// await check.save()
					} else {
						inputData.push(test)
					}
				}

				const trx = await Database.beginTransaction()
				const insertData = await trx.insert(inputData).into('daily_checklists')
				if (insertData) {
					trx.commit()
					fs.unlink(filePath, (err) => {
						if (err) {
							console.log(`failed when deleting ${filePath} file`)
						}
						console.log(`${filePath} is deleted from directory`)
					})
					return {
						success: true,
						message: inputData.length + ' row data has been imported',
					}
				} else {
					trx.rollback()
				}
				return {
					success: false,
					type: 'warning',
					message: 'all data your input already exist',
				}
			} catch (err) {
				return {
					success: false,
					message: 'Failed when uploading daily hour meter, please try again.',
					reason: err.message,
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
