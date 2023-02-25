'use strict'

const EquipmentPerformanceHelpers = use('App/Controllers/Http/Helpers/MamEquipmentPerformance')
const Database = use('Database')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const { raw } = require('mysql')
const Helpers = use('Helpers')
const MasEquipment = use('App/Models/MasEquipment')
const EquipmentPerformance = use('App/Models/MamEquipmentPerformance')
const _ = require('underscore')
const DailyDowntime = use('App/Models/DailyDowntimeEquipment')
const DailyChecklist = use('App/Models/DailyChecklist')

class EquipmentPerformanceController {
	async index({ view }) {
		return view.render('operation.equipment-performance.index')
	}

	async create({ view }) {
		return view.render('operation.equipment-performance.create')
	}

	async list({ auth, request, view }) {
		const equip = (await MasEquipment.query().orderBy('kode', 'asc').fetch()).toJSON()
		const get_downtime = (
			await DailyDowntime.query()
				.where((e) => {
					e.where(Database.raw('MONTH(breakdown_start)'), '1').where(Database.raw('YEAR(breakdown_start)'), '2023')
					e.orWhere(Database.raw('MONTH(breakdown_finish)'), '1').where(Database.raw('YEAR(breakdown_finish)'), '2023')
					e.orWhere(Database.raw('ISNULL(breakdown_finish)'))
				})
				.fetch()
		).toJSON()

		const hm_unit = await Database.select(Database.raw('SUM(used_smu) as HM'), 'unit_id').from('daily_checklists').where(Database.raw('MONTH(tgl)'), '1').where(Database.raw('YEAR(tgl)'), '2023').groupBy('unit_id')
		let hm_unit_group = _.indexBy(hm_unit, (e) => {
			return e.unit_id
		})
		let jam_kerja = moment('2023-01', 'YYYY-MM').daysInMonth() * 24
		let breakdown_group = _.groupBy(get_downtime, function (e) {
			return e.equip_id
		})
		// console.log(breakdown_group['597'])

		let data_equip = equip.map((data) => {
			let tot_hours = 0
			breakdown_group[`${data.id}`]?.map((ed) => {
				tot_hours += ed.downtime_total
			})
			let jam_breakdown = Math.round(tot_hours / 60) <= jam_kerja ? Math.round(tot_hours / 60) : jam_kerja
			let jam_operasi = hm_unit_group[`${data.id}`]?.HM || 0
			let total_bd = breakdown_group[`${data.id}`]?.length | 0
			return {
				...data,
				downtime: jam_breakdown,
				pa: (((jam_kerja - jam_breakdown) / jam_kerja) * 100).toFixed(2),
				hm: jam_operasi,
				ma: isNaN(((jam_operasi / (jam_operasi + jam_breakdown)) * 100).toFixed(2)) ? parseFloat(0).toFixed(2) : ((jam_operasi / (jam_operasi + jam_breakdown)) * 100).toFixed(2),
				ua: ((jam_operasi / (jam_kerja - jam_breakdown)) * 100).toFixed(2),
				mttr: Math.round(jam_breakdown / total_bd) | 0,
				mtbs: Math.round(jam_operasi / total_bd) | 0,
			}
		})

		data_equip = _.reject(data_equip, (e) => {
			return e.ma == 0 && e.pa == 0
		})

		const req = request.all()
		const user = await userValidate(auth)

		if (!user) {
			return view.render('401')
		}
		const data = await EquipmentPerformanceHelpers.LIST(req)
		return view.render('operation.equipment-performance.list', { list: data_equip })
	}

	async show({ auth, params, view }) {
		await auth.getUser()

		const data = await EquipmentPerformanceHelpers.SHOW(params)
		return view.render('operation.equipment-performance.show', {
			data: data,
		})
	}

	async store({ auth, request }) {
		const req = request.all()

		const { month, site_id } = req

		let user = null

		// user validation
		try {
			user = await auth.getUser()
		} catch (err) {
			return {
				error: true,
				message: err.message,
				validation: 'You are not authorized !',
			}
		}

		// get current month
		const currentMonth = moment(month).startOf('month').format('YYYY-MM-DD')

		// get all production equipment
		const equipments = (
			await MasEquipment.query()
				.where((wh) => {
					wh.whereIn('tipe', ['excavator', 'general support', 'hauler truck', 'fuel truck', 'water truck', 'bulldozer'])
					wh.where('aktif', 'Y')
				})
				.fetch()
		).toJSON()

		// get total hours in month
		const daysInMonth = moment(currentMonth).daysInMonth()
		const getTotalHours = daysInMonth * 24

		// get equipment ids
		const equipmentIds = equipments.map((v) => v.id)

		// check wheter is data already in database
		const getData = await EquipmentPerformance.query().where('month', currentMonth).last()
		if (getData) {
			return {
				error: true,
				message: 'Data already in the database !',
			}
		}

		// process the data
		for (const equipment of equipmentIds) {
			const newEquipmentPerformance = new EquipmentPerformance()
			const now = moment(month).format('DD MMM')
			const to = moment(month).format('DD MMM')

			newEquipmentPerformance.fill({
				month: currentMonth,
				site_id: site_id,
				period: `${now} - ${to}`,
				period_date_start: currentMonth,
				period_date_end: currentMonth,
				equip_id: equipment,
				upload_by: user.id,
				mohh: getTotalHours,
				target_downtime_monthly: getTotalHours * (1 - 0 / 100), // 85 is default budget pa
			})

			await newEquipmentPerformance.save()

			console.log(`---- equipment id ${equipment} saved to the monthly performance ----`)
		}

		return {
			success: true,
			message: 'Success creating monthly data equipment performance',
		}
	}
}

module.exports = EquipmentPerformanceController

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
