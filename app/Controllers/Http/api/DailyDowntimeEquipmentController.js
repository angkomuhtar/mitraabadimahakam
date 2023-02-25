'use strict'
const { performance } = require('perf_hooks')
const diagnoticTime = use('App/Controllers/Http/customClass/diagnoticTime')
const EquipmentPerformance = use('App/Models/MamEquipmentPerformance')
const MasEquipment = use('App/Models/MasEquipment')
const moment = require('moment')

class DailyDowntimeEquipment {
	async index({ request }) {
		const data = await EquipmentPerformance.query().fetch()
		return {
			msg: 'test',
			data: data,
		}
	}

	async uploadFile({ auth, request }) {
		const validateFile = {
			types: ['xls'],
			types: 'application',
		}

		const reqFile = request.file('daily_downtime_file', validateFile)

		if (!!reqFile.extname.includes('xls')) {
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

			return {
				title: [],
				data: [],
				fileName: aliasName,
			}
		} else {
			return {
				success: false,
				message: 'Gagal mengupload file downtime activity ..., silahkan coba lagi',
			}
		}
	}

	async uploadProcess({ request }) {}
}

module.exports = DailyDowntimeEquipment
