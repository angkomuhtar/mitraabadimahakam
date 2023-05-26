'use strict'

const TimeSheet = use('App/Controllers/Http/Helpers/TimeSheet')
const P2Hhelpers = use('App/Controllers/Http/Helpers/P2H')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const SysOption = use('App/Models/SysOption')
const _ = require('underscore')
const Helpers = use('Helpers')
const MasEquipment = use('App/Models/MasEquipment')
const DailyChecklist = use('App/Models/DailyChecklist')
const fs = require('fs')
const Database = use('Database')

class DailyTimesheetController {
	async index({ view, request }) {
		return view.render('operation.daily-timesheet.index')
	}

	async list({ view, request, response, auth }) {
		const req = request.all()
		const data = (await TimeSheet.ALL(req)).toJSON()
		return view.render('operation.daily-timesheet.list', { list: data, keyword: req.keyword })
	}

	async create({ auth, view }) {
		console.log('....')
		return view.render('operation.daily-timesheet.create')
	}

	async store({ auth, request }) {
		let usr
		try {
			usr = await auth.getUser()
		} catch (error) {
			return {
				success: false,
				message: 'You not authorized...',
			}
		}
		const req = request.raw()
		const reqJson = JSON.parse(req)

		const data = await TimeSheet.POST(reqJson, usr)
		return data
	}

	async listP2H({ view, request }) {
		const req = request.only(['id', 'keyword', 'page'])
		try {
			const p2hItems = await P2Hhelpers.WITH_TIMESHEET_ID(req)
			return view.render('_component.list-p2h', { list: p2hItems })
		} catch (error) {
			throw new Error('Tidak dapat load data...')
		}
	}

	async addEvent({ view }) {
		return view.render('_component.list-event-timesheet')
	}

	async show({ view, params, auth }) {
		const data = (await TimeSheet.GET_ID(params)).toJSON()
		console.log(data)
		return view.render('operation.daily-timesheet.show', { data: data })
	}

	async update({ auth, params, request }) {
		const usr = await auth.getUser()
		const req = JSON.parse(request.raw())
		req.end_smu = req.end_smu === '-' ? null : req.end_smu
		req.event = req.event.filter((item) => item.event_id != null)
		req.event = req.event.map((item) => {
			delete item['smu_event']
			return {
				...item,
				user_id: usr.id,
				timesheet_id: params.id,
				equip_id: req.unit_id,
			}
		})

		try {
			const data = await TimeSheet.UPDATE(params, req)
			console.log(data)
			return {
				success: true,
				message: 'TIME SHEET update success...',
			}
		} catch (error) {
			console.log(error)
			return {
				success: false,
				message: 'TIME SHEET update failed...',
			}
		}
	}

	async upload({ auth, request }) {
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
		var unit = await MasEquipment.pair('id', 'kode')
		const validationOptions = {
			types: ['application'],
			extname: ['xls', 'xlsx'],
		}
		const reqFile = request.file('file_u', validationOptions)

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
					header: { rows: 1 },
					sheets: ['Data'],
					columnToKey: {
						B: 'date',
						C: 'shift',
						D: 'id_number',
						I: 'start_smu',
						J: 'end_smu',
					},
				})

				var dataX = xlsx[Object.keys(xlsx)[0]]
				console.log(dataX)
				var inputData = []

				for (const data of dataX) {
					console.log(data.start_smu)

					if (data.start_smu) {
						var key = _.findKey(unit, function (e) {
							return e === data.id_number.replace(' ', '')
						})
						if (!key) {
							return {
								success: false,
								type: 'warning',
								message: `kode equipment ${data.id_number} tidak ditemukan`,
							}
						}
						var date = moment(data.date).add(8, 'hours').format('YYYY-MM-DD')
						console.log(date, key, data.shift == 'DS' ? 1 : 2)
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
					message: 'semua data telah diinput sebelumnya, pastikan data dan tgl benar.!',
				}
			} catch (err) {
				return {
					success: false,
					message: 'Failed when uploading daily hour meter, please try again.',
					reason: err.message,
				}
			}
		} else {
			return {
				success: false,
				message: 'Gagal mengupload file TimeSheet ..., silahkan coba lagi',
			}
		}
	}
}

module.exports = DailyTimesheetController
