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
const ViewBreakdown = use('App/Models/ViewBreakdown')
const DailyChecklist = use('App/Models/DailyChecklist')

function convertMinutes(minutes) {
	const days = Math.floor(minutes / 1440)
	const hours = Math.floor((minutes % 1440) / 60)
	const remainingMinutes = minutes % 60
	return `${days > 0 ? days + 'h, ' : ''} ${hours > 0 ? hours + 'j, ' : ''} ${remainingMinutes} m`
	// return `${hours > 0 ? String(hours).padStart(2, '0') : '00'} : ${remainingMinutes > 0 ? String(remainingMinutes).padStart(2, '0') : '00'}`
	return `${hours > 0 ? hours + 'j ' : ''} ${remainingMinutes > 0 ? remainingMinutes + 'm' : ''}`
}
class EquipmentPerformanceController {
	async index({ view }) {
		const unit = (await MasEquipment.query().where('aktif', 'Y').whereRaw('kode LIKE "ME%"').orWhereRaw('kode LIKE "MDT%"').orWhereRaw('kode LIKE "OHT%"').orderBy('kode').fetch()).toJSON()
		const comp = await Database.from('sys_options').whereIn('group', ['COMPONENT', 'ALL']).where('status', 'Y').orderBy('urut')
		const bd_type = await Database.from('sys_options').whereIn('group', ['BD TYPE', 'ALL']).where('status', 'Y').orderBy('urut')

		return view.render('operation.equipment-performance.index', { unit, comp, bd_type })
	}

	async create({ view }) {
		return view.render('operation.equipment-performance.create')
	}

	async list({ auth, request }) {
		const req = request.all()
		let start_date = moment().format('YYYY-MM-01 HH:mm:ss')
		let end_date = moment().endOf('M').format('YYYY-MM-DD 23:59:59')
		console.log(req.periode)
		if (req.periode != '') {
			start_date = moment(req.periode, 'MM YYYY').format('YYYY-MM-01 HH:mm:ss')
			end_date = moment(req.periode, 'MM YYYY').endOf('M').format('YYYY-MM-DD 23:59:59')
		}
		console.log(start_date, end_date, req.periode)
		let Page = req.start == 0 ? 1 : req.start / req.length + 1

		const equip = MasEquipment.query().with('downtime', (build) => {
			build
				//
				.whereBetween('breakdown_start', [start_date, end_date])
				.orWhereBetween('breakdown_finish', [start_date, end_date])
				.orWhere((e) => {
					e.where('breakdown_start', '<=', start_date)
					e.whereRaw('isNull(breakdown_finish)')
				})
		})

		if (req.unit_number != 0) {
			equip.where('id', req.unit_number)
		} else {
			equip.whereRaw('kode LIKE "ME%"').orWhereRaw('kode LIKE "MDT%"').orWhereRaw('kode LIKE "OHT%"')
		}

		let f_equip = (await equip.orderBy('kode', 'asc').paginate(Page, req.length)).toJSON()

		const hm_unit = await Database.select(Database.raw('MAX(end_smu) as end'), Database.raw('MIN(begin_smu) as start'), 'unit_id').from('daily_checklists').whereBetween('tgl', [start_date, end_date]).groupBy('unit_id')
		let hm_unit_group = _.indexBy(hm_unit, (e) => {
			return e.unit_id
		})
		console.log('unit HM', hm_unit)
		let jam_kerja = moment(start_date).daysInMonth() * 24 * 60

		let data_equip = f_equip.data.map((data) => {
			let tot_hours = 0
			let sch = 0
			let uns = 0
			let ac = 0
			let sch_h = 0
			let uns_h = 0
			let ac_h = 0
			// console.log(data.downtime)
			data.downtime.map((ed) => {
				let timeDiff = 0
				if (ed.breakdown_finish) {
					timeDiff = moment(ed.breakdown_finish).diff(moment(ed.breakdown_start), 'minutes')
				} else {
					timeDiff = moment(end_date).isSameOrBefore(moment()) ? moment(end_date).diff(moment(ed.breakdown_start), 'minutes') : moment().diff(moment(ed.breakdown_start), 'minutes')
				}

				if (ed.downtime_status == 'SCH') {
					sch++
					sch_h += timeDiff
				}
				if (ed.downtime_status == 'UNS') {
					uns++
					uns_h += timeDiff
				}
				if (ed.downtime_status == 'ac') {
					ac++
					ac_h += timeDiff
				}
				tot_hours += timeDiff
			})

			// console.log('ini yang ', hm_unit_group[`${data.id}`])
			let jam_breakdown = tot_hours <= jam_kerja ? tot_hours : jam_kerja
			let jam_operasi = (hm_unit_group[`${data.id}`]?.end - hm_unit_group[`${data.id}`]?.start) * 60 || 0
			let total_bd = data.downtime.length
			let mttr = isNaN(Math.round(jam_breakdown / total_bd)) ? 0 : Math.round(jam_breakdown / total_bd)
			return {
				...data,
				downtime: convertMinutes(jam_breakdown),
				pa: (((jam_kerja - jam_breakdown) / jam_kerja) * 100).toFixed(2),
				hm: hm_unit_group[`${data.id}`]?.end - hm_unit_group[`${data.id}`]?.start || 0,
				ma: isNaN(((jam_operasi / (jam_operasi + jam_breakdown)) * 100).toFixed(2)) ? parseFloat(0).toFixed(2) : ((jam_operasi / (jam_operasi + jam_breakdown)) * 100).toFixed(2),
				ua: jam_kerja == jam_breakdown ? 0 : ((jam_operasi / (jam_kerja - jam_breakdown)) * 100).toFixed(2),
				eu: ((jam_operasi / jam_kerja) * 100).toFixed(2),
				mttr: convertMinutes(mttr),
				mtbs: jam_operasi == 0 ? '0 m' : convertMinutes(Math.round(jam_operasi / total_bd)),
				total_bd: total_bd,
				mohh: jam_kerja / 60 + ' jam',
				sch: sch,
				uns: uns,
				ac: ac,
				ac_h: convertMinutes(ac_h),
				sch_h: convertMinutes(parseInt(sch_h)),
				uns_h: convertMinutes(uns_h),
				tot_h: convertMinutes(tot_hours),
				periode: req.periode || moment().format('MMM YYYY'),
			}
		})

		const user = await userValidate(auth)

		return {
			draw: req.draw,
			recordsTotal: f_equip.total,
			recordsFiltered: f_equip.total,
			data: data_equip,
		}
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
