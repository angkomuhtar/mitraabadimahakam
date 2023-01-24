'use strict'
const db = use('Database')
const MasSop = use('App/Models/DailyDowntimeEquipment')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const { uniqueId } = require('underscore')
const { uid } = require('uid')
const MasEquipment = use('App/Models/MasEquipment')
const DailyDowntimeEquipment = use('App/Models/DailyDowntimeEquipment')
const EquipmentPerformance = use('App/Models/MamEquipmentPerformance')
const EquipmentPerformanceDetails = use('App/Models/MamEquipmentPerformanceDetails')
const DailyChecklist = use('App/Models/DailyChecklist')
const MasShift = use('App/Models/MasShift')
const _ = require('underscore')

class DailyDowntime {
	async LIST(req) {
		const limit = req.limit || 50
		const halaman = req.page === undefined ? 1 : parseInt(req.page)
		console.log(req)
		let dailyDowntime = (
			await DailyDowntimeEquipment.query()
				.with('equipment')
				.where((w) => {
					if (req.site_id) {
						w.where('site_id', req.site_id)
					}
					if (req.equip_id) {
						w.where('equip_id', req.equip_id)
					}
					if (req.downtime_status) {
						w.where('downtime_status', req.downtime_status)
					}
					if (req.breakdown_start && req.breakdown_finish) {
						w.where('breakdown_start', '>=', req.breakdown_start)
						w.where('breakdown_finish', '<=', req.breakdown_finish)
					}
				})
				.paginate(halaman, limit)
		).toJSON()
		dailyDowntime = {
			...dailyDowntime,
			data: dailyDowntime.data.map((v) => {
				return {
					...v,
					breakdown_start: moment(v.breakdown_start).format('YYYY-MM-DD HH:mm'),
					breakdown_finish: moment(v.breakdown_finish).format('YYYY-MM-DD HH:mm'),
					person_in_charge: v.person_in_charge || 'Tidak Ada',
				}
			}),
		}
		return dailyDowntime
	}

	async uploadProcessActivity(req, filePath, user) {
		let trx = await db.beginTransaction()
		const sampleSheet = req.sheet || 'DAILY ACTIVITY'
		const xlsx = excelToJson({
			sourceFile: filePath,
			header: {
				rows: 6,
			},
		})

		const sheet1 = 'PERFORMANCE'
		const getEndIndex = xlsx[sheet1].findIndex((v) => v.B === 2)
		const performanceData = [...xlsx[sheet1].slice(1, getEndIndex)]
			.filter((v) => v.A && v.B)
			.map((v) => {
				return {
					name: v.C,
					model: v.B,
					budget_pa: v.E,
				}
			})

		const data = []
		const currentMonth = moment(req.date).startOf('month').format('YYYY-MM-DD')
		const selectedDate = moment(req.date).format('YYYY-MM-DD')
		const sheetData = xlsx[sampleSheet]
		const daysInMonth = moment(currentMonth).daysInMonth()
		const getTotalHours = daysInMonth * 24

		const UPDATE_EQUIPMENT_MASTER = async () => {
			if (performanceData.length > 0) {
				for (const data of performanceData) {
					const equipment = await MasEquipment.query().where('kode', 'like', `%${data.name}%`).first()
					if (equipment) {
						// update equipment's model
						equipment.merge({
							unit_model: data.model,
						})
						await equipment.save(trx)
						// update budget pa
						const eq_performance = await EquipmentPerformance.query()
							.where((wh) => {
								wh.where('month', currentMonth)
								wh.where('equip_id', equipment.id)
							})
							.first()
						if (eq_performance) {
							eq_performance.merge({
								budget_pa: data.budget_pa * 100,
								target_downtime_monthly: eq_performance.mohh * (1 - data.budget_pa),
							})
							await eq_performance.save(trx)
						}
					}
				}
			}
		}

		// check last data
		const GET_LAST_DATE_DAILY_EQUIPMENT_PERFORMANCE = async () => {
			const lastRow = await EquipmentPerformanceDetails.query()
				.where((wh) => {
					wh.where('site_id', req.site_id)
					wh.where('id', '!=', '0')
				})
				.with('site')
				.orderBy('date', 'desc')
				.last()

			if (lastRow) {
				const lastRowDate = moment(lastRow.date).format('YYYY-MM-DD')

				console.log('last row date >> ', lastRowDate)
				if (selectedDate === lastRowDate) {
					console.log('same date')
					throw new Error(`Data tanggal ${lastRowDate} sudah ada, silahkan untuk mengupload tanggal berikutnya ${moment(lastRowDate).add(1, 'days').format('YYYY-MM-DD')} ..`)
				}

				const diff = moment(selectedDate).diff(lastRowDate, 'days')

				console.log('diff >> ', diff)
				if (diff > 1) {
					console.log('more than 1 days')
					throw new Error(`Tidak dapat mengupload data untuk lebih dari 1 tanggal .. \n \n  \n data terakhir adalah tanggal ${lastRowDate} \n \n silahkan untuk mengupload untuk tanggal ${moment(lastRowDate).add(1, 'days').format('YYYY-MM-DD')}`)
				}

				if (new Date(selectedDate) <= new Date(lastRowDate)) {
					console.log('back date')
					throw new Error(`Tidak dapat mengupload ulang data tanggal sebelumnya!. \n data terakhir adalah tanggal ${lastRowDate} \n \n silahkan untuk mengupload untuk tanggal ${moment(lastRowDate).add(1, 'days').format('YYYY-MM-DD')}`)
				}
			}
		}

		try {
			// check last date
			await GET_LAST_DATE_DAILY_EQUIPMENT_PERFORMANCE()
			// update master equipment and pa bugdet equoipment regularly
			await UPDATE_EQUIPMENT_MASTER()
		} catch (err) {
			return {
				success: false,
				message: err.message,
			}
		}
		/**
		 * Check Wheter there is equipment performance master data for current month
		 */
		const masterEquipmentPerformanceCheck = await EquipmentPerformance.query()
			.where((wh) => {
				wh.where('month', moment(selectedDate).startOf('month').format('YYYY-MM-DD'))
			})
			.last()
		/**
		 * CAT 320GC,HITACHI ZX870LCH,SANY SY750H,SANY SY365H,DOOSAN DX800LC,SANY SY500H,HYUNDAI R210W-9S,HYUNDAI HX210S,CAT 395,CAT 330,SANY SY500H,D10R,CAT D9,CAT D6R2 XL,CAT D6GC,CAT 14M,SEM 921,SEM 922,CAT 773E,CMT96,TR50,A60D,FM260 JD,LS60HZ,HILIGHT V4,FM260 JD,T50,CF-48H-SS,LS60HZ,FUSO FN62,PF6TB-22,GEP33-3,SEM 636D,ATLAS COPCO XATS350,COMPACTOR CS11GC,Light Vehicle,KOMATSU375
		 */
		const monthName = moment(selectedDate).startOf('month').format('MMMM')
		if (!masterEquipmentPerformanceCheck) {
			return {
				success: false,
				message: 'Equipment Performance Bulanan Belum di buat untuk bulan ' + monthName,
			}
		}
		const modelArr =
			`CAT 320GC,HITACHI ZX870LCH,SANY SY750H,SANY SY365H,DOOSAN DX800LC,SANY SY500H,HYUNDAI R210W-9S,HYUNDAI HX210S,CAT 395,CAT 330,SANY SY500H,D10R,CAT D9,CAT D6R2 XL,CAT D6GC,CAT 14M,SEM 921,SEM 922,CAT 773E,CMT96,TR50,A60D,FM260 JD,LS60HZ,HILIGHT V4,FM260 JD,T50,CF-48H-SS,LS60HZ,FUSO FN62,PF6TB-22,GEP33-3,SEM 636D,ATLAS COPCO XATS350,COMPACTOR CS11GC,Light Vehicle,KOMATSU375`.split(
				',',
			)
		for (const obj of sheetData.filter((kode) => kode.B)) {
			try {
				const equipmentExist = await MasEquipment.query().where('kode', obj.B).first()
				if (!equipmentExist) {
					const newEquipment = new MasEquipment()
					// create the new equipment
					newEquipment.fill({
						kode: obj.B,
						site_id: req.site_id,
						tipe: 'general support',
						brand: 'TEMP',
						received_date: moment(req.date).format('YYYY-MM-DD'),
						received_hm: '0',
						is_warranty: 'Y',
						warranty_date: moment(req.date).format('YYYY-MM-DD'),
						is_owned: 'Y',
						unit_sn: uid(6),
						unit_model: obj.D || uid(6),
						engine_sn: uid(6),
						engine_model: 'TEMP',
						fuel_capacity: '0',
						qty_capacity: '0',
						satuan: 'MT',
						remark: 'created from daily downtime upload ' + selectedDate,
						created_by: user.id,
					})
					await newEquipment.save()
					// create to the equipment performance too
					const newEquipmentPerformance = new EquipmentPerformance()
					const now = moment(currentMonth).format('DD MMM')
					const to = moment(selectedDate).format('DD MMM')

					if (modelArr.includes(newEquipment.unit_model)) {
						const checkEquipPerformance = await EquipmentPerformance.query()
							.where((wh) => {
								wh.where('month', currentMonth)
								wh.where('equip_id', newEquipment.id)
								wh.where('upload_by', user.id)
							})
							.last()

						if (!checkEquipPerformance) {
							newEquipmentPerformance.fill({
								month: currentMonth,
								period: `${now} - ${to}`,
								period_date_start: currentMonth,
								period_date_end: selectedDate,
								equip_id: newEquipment.id,
								upload_by: user.id,
								mohh: getTotalHours,
								target_downtime_monthly: getTotalHours * (1 - 0 / 100), // default budget pa is 85
							})
							await newEquipmentPerformance.save()
						}
					}
				}
			} catch (error) {
				return {
					success: false,
					message: 'Failed when inserting new equipment kode ' + obj.B,
				}
			}
		}

		// methods
		const GET_EQUIPMENT_DATA = async (tipe, brand, name) => {
			let result = null

			if (name) {
				const equipment = await MasEquipment.query().where('kode', name).last()
				if (equipment) {
					result = equipment.toJSON()
					return result
				} else {
					throw new Error(`Equipment Unit ${name} tidak di temukan pada master equipment...`)
				}
			}
		}

		try {
			for (const value of sheetData) {
				// check after special paste (values only)
				if (typeof value.I === 'number' && typeof value.J === 'number' && typeof value.K === 'number') {
					throw new Error(`Tanggal & Jam breakdown harus berupa Tanggal dan waktu (jam), harap cek baris No.${value.A}`)
				}

				let hour_start = String(value.J).split(' ')[4] || '00:00:00'
				let hour_finish = String(value.K).split(' ')[4] || '00:00:00'

				const date = moment(value.I).add(1, 'day').format('YYYY-MM-DD')
				const bd_start = moment(`${date} ${hour_start}`).add(3, 'minute').format('YYYY-MM-DD HH:mm:ss')
				const bd_finish = moment(`${date} ${hour_finish}`).add(3, 'minute').format('YYYY-MM-DD HH:mm:ss')

				const obj = {
					no: value.A,
					uid: `${moment(date).format('YYYYMM.DDHHMM')}.${(await GET_EQUIPMENT_DATA(value.C, value.D, value.B))?.kode}` || value.B,
					unitName: (await GET_EQUIPMENT_DATA(value.C, value.D, value.B))?.id || value.B,
					location: value.E || ' ',
					problem: value.G || ' ',
					action: value.H || 'Belum Ada',
					date: date,
					bd_start: bd_start,
					bd_finish: bd_finish,
					// #TODO : fix this floating number
					total_bd: value.L || 0,
					bd_status: value.M ? value.M.toUpperCase() : ' ',
					component_group: value.N?.toUpperCase() || ' ',
					downtime_code: value.O || ' ',
					pic: value.P || ' ',
				}
				data.push(obj)
			}

			// filter data by date
			const filteredData = data.filter((v) => new Date(v.date) >= new Date(req.date) && new Date(v.date) <= new Date(req.date))
			// insert data to the table
			const afterUpload = []
			const dailyActivityEquipArr = []
			const equipmentFreqBUS = []
			let count = 0
			for (const data of filteredData) {
				if (!data.unitName) {
					throw new Error(`Tidak ada nama equipment di baris No. ${data.no} \n \n harap di isi dan coba untuk mengupload ulang.`)
				}
				const downtimeCheck = await DailyDowntimeEquipment.query()
					.where((wh) => {
						wh.where('site_id', req.site_id)
						wh.where('equip_id', data.unitName)
						wh.where('problem_reported', data.problem)
						// wh.where('corrective_action', data.action)
						wh.where('breakdown_start', data.bd_start)
						// wh.where('breakdown_finish', data.bd_finish)
						// wh.where('downtime_total', data.total_bd)
						// wh.where('status', data.bd_status)
						// wh.where('component_group', data.component_group)
						// wh.where('downtime_status', data.downtime_code)
						// wh.where('person_in_charge', )
					})
					.last()

				if (downtimeCheck) {
					downtimeCheck.merge({
						site_id: req.site_id,
						downtime_code: data.uid,
						equip_id: data.unitName,
						location: data.location || 'tidak diisi',
						problem_reported: data.problem || 'Tidak Ada',
						corrective_action: data.action || 'Tidak Ada',
						breakdown_start: data.bd_start,
						breakdown_finish: data.bd_finish,
						downtime_total: data.total_bd,
						status: data.bd_status,
						component_group: data.component_group,
						downtime_status: data.downtime_code,
						person_in_charge: data.pic,
						urut: count,
					})

					try {
						await downtimeCheck.save(trx)
						console.log(`-- update downtime id ${downtimeCheck.id} --`)
					} catch (err) {
						await trx.rollback()
						return {
							success: false,
							message: `failed when updating daily downtime id ${downtimeCheck.id} to database. Reason : \n` + err.message,
						}
					}
				} else {
					// if downtime not found then create a new one
					count += 1
					const newDailyDowntime = new DailyDowntimeEquipment()
					newDailyDowntime.fill({
						site_id: req.site_id,
						downtime_code: data.uid,
						equip_id: data.unitName,
						location: data.location || 'tidak diisi',
						problem_reported: data.problem || 'Tidak Ada',
						corrective_action: data.action || 'Tidak Ada',
						breakdown_start: data.bd_start,
						breakdown_finish: data.bd_finish,
						downtime_total: data.total_bd,
						status: data.bd_status,
						component_group: data.component_group,
						downtime_status: data.downtime_code,
						person_in_charge: data.pic,
						urut: count,
					})

					try {
						await newDailyDowntime.save(trx)
						console.log(`-- insert downtime id ${newDailyDowntime.id} --`)
						afterUpload.push(newDailyDowntime.toJSON())
						if (data.bd_status === 'RFU' && data.downtime_code === 'UNS') {
							equipmentFreqBUS.push({
								eqId: data.unitName,
							})
						}
					} catch (err) {
						await trx.rollback()
						return {
							success: false,
							message: 'failed when inserting daily downtime to database. Reason : \n' + err.message,
						}
					}
				}
			}

			const GET_COUNT_FREQ_BUS_EQUIPMENT = (equip_id) => {
				let count = 0

				if (equipmentFreqBUS.length > 0) {
					for (const value of equipmentFreqBUS) {
						if (value.eqId === equip_id) {
							count += 1
						}
					}
				}

				return count
			}
			// update existing data for equipment performance
			const GET_COUNT_SCHEDULED_BREAKDOWN = async (type, equipId) => {
				let countAll = 0

				if (type === 'SCH') {
					let countSch = afterUpload.filter((v) => v.equip_id === equipId && v.downtime_status === 'SCH').reduce((a, b) => a + b.downtime_total, 0) || 0
					console.log('count sch >> ', countSch)
					countAll += countSch
					return countSch
				}

				if (type === 'UNS') {
					let countUns = afterUpload.filter((v) => v.equip_id === equipId && v.downtime_status === 'UNS').reduce((a, b) => a + b.downtime_total, 0) || 0
					console.log('count uns >> ', countUns)
					countAll += countUns
					return countUns
				}

				if (type === 'ACD') {
					let countAcd = afterUpload.filter((v) => v.equip_id === equipId && v.downtime_status === 'ACD').reduce((a, b) => a + b.downtime_total, 0) || 0
					console.log('count acd >> ', countAcd)
					countAll += countAcd
					return countAcd
				}

				if (type === 'ALL') {
					return countAll
				}
			}

			/**
			 * DAILY EQUIPMENT PERFORMANCE
			 */
			let equipments = (
				await MasEquipment.query()
					.where((wh) => {
						wh.whereIn('unit_model', modelArr)
						wh.where('aktif', 'Y')
					})
					.fetch()
			).toJSON()

			const equipIds = _.uniq([...filteredData.map((v) => v.unitName), ...equipments.map((v) => v.id)]).map((v) => {
				return {
					id: v,
				}
			})

			for (const eq of equipIds) {
				const SoM = moment(selectedDate).startOf('month').format('YYYY-MM-DD')
				const freq_bus = GET_COUNT_FREQ_BUS_EQUIPMENT(eq.id) || 1

				let prevDate = null
				if (selectedDate.split('-')[2] === '01') {
					prevDate = moment(selectedDate).format('YYYY-MM-DD')
				} else {
					prevDate = moment(selectedDate).subtract(1, 'day').format('YYYY-MM-DD')
				}

				const eq_check = await this.GET_EQUIPMENT_PERFORMANCE_EQ_ID(eq.id, req.site_id)

				let getLastBudgetPA = null
				if (eq_check) {
					getLastBudgetPA = await EquipmentPerformance.query(trx)
						.where((wh) => {
							wh.where('equip_id', eq.id)
							wh.where('period_date_start', SoM)
							wh.where('period_date_end', prevDate)
						})
						.last()
				}

				if (eq_check && !getLastBudgetPA) {
					getLastBudgetPA = await EquipmentPerformance.query(trx)
						.where((wh) => {
							wh.where('equip_id', eq.id)
							wh.where('period_date_start', SoM)
						})
						.last()
				}

				const breakdown_hours_scheduled = await GET_COUNT_SCHEDULED_BREAKDOWN('SCH', eq.id)
				const breakdown_hours_unscheduled = await GET_COUNT_SCHEDULED_BREAKDOWN('UNS', eq.id)
				const breakdown_hours_accident = await GET_COUNT_SCHEDULED_BREAKDOWN('ACD', eq.id)
				const breakdown_hours_total = breakdown_hours_scheduled + breakdown_hours_unscheduled + breakdown_hours_accident

				let dailyEquipmentChecks = null

				if (eq_check) {
					dailyEquipmentChecks = await EquipmentPerformanceDetails.query(trx)
						.where((wh) => {
							wh.where('equip_id', eq.id)
							wh.where('site_id', req.site_id)
							wh.where('date', selectedDate)
						})
						.last()
				}

				try {
					const budget_pa = getLastBudgetPA?.budget_pa || 0
					if (dailyEquipmentChecks) {
						dailyEquipmentChecks.merge({
							site_id: req.site_id,
							budget_pa: budget_pa,
							equip_id: eq.id,
							target_downtime_monthly: 24 * (1 - budget_pa / 100), // daily,
							mohh: 24, // daily
							date: selectedDate,
							breakdown_hours_scheduled: breakdown_hours_scheduled,
							breakdown_hours_unscheduled: breakdown_hours_unscheduled,
							breakdown_hours_accident: breakdown_hours_accident,
							breakdown_hours_total: breakdown_hours_total,
							actual_pa: ((24 - breakdown_hours_total) / 24) * 100,
							breakdown_ratio_scheduled: (breakdown_hours_scheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
							breakdown_ratio_unscheduled: (breakdown_hours_unscheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
							actual_mttr: !isFinite(breakdown_hours_unscheduled / freq_bus) ? 0 : breakdown_hours_unscheduled / freq_bus,
							freq_bus: freq_bus,
						})
						await dailyEquipmentChecks.save(trx)
						dailyActivityEquipArr.push(dailyEquipmentChecks.equip_id)
						console.log('success update daily equipment performance id >> ', dailyEquipmentChecks.id)
					} else {
						let newEquipmentPerformance = new EquipmentPerformanceDetails()
						newEquipmentPerformance.fill({
							site_id: req.site_id,
							budget_pa: budget_pa,
							equip_id: eq.id,
							target_downtime_monthly: 24 * (1 - budget_pa / 100), // daily,
							mohh: 24, // daily
							date: selectedDate,
							breakdown_hours_scheduled: breakdown_hours_scheduled,
							breakdown_hours_unscheduled: breakdown_hours_unscheduled,
							breakdown_hours_accident: breakdown_hours_accident,
							breakdown_hours_total: breakdown_hours_total,
							actual_pa: ((24 - breakdown_hours_total) / 24) * 100,
							breakdown_ratio_scheduled: (breakdown_hours_scheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
							breakdown_ratio_unscheduled: (breakdown_hours_unscheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
							actual_mttr: !isFinite(breakdown_hours_unscheduled / freq_bus) ? 0 : breakdown_hours_unscheduled / freq_bus,
							freq_bus: freq_bus,
							upload_by: user.id,
						})
						await newEquipmentPerformance.save(trx)
						dailyActivityEquipArr.push(newEquipmentPerformance.equip_id)
						console.log('success insert daily equipment performance id >> ', newEquipmentPerformance.id)
					}
				} catch (err) {
					console.log('error daily performance >> ', err)
					await trx.rollback(trx)
					return {
						success: false,
						message: 'failed when inserting eq.perf details to database. Reason : \n' + err.message,
					}
				}
				// check the timesheet
			}

			/**
			 * MONTHLY EQUIPMENT PERFORMANCE
			 */
			const equipmentPerformanceData = (
				await EquipmentPerformance.query()
					.where((wh) => {
						wh.where('month', currentMonth)
					})
					.fetch()
			).toJSON()

			for (const value of equipmentPerformanceData) {
				const SoM = moment(selectedDate).startOf('month').format('YYYY-MM-DD')
				let prevDate = null
				if (selectedDate.split('-')[2] === '01') {
					prevDate = moment(selectedDate).format('YYYY-MM-DD')
				} else {
					prevDate = moment(selectedDate).subtract(1, 'day').format('YYYY-MM-DD')
				}

				let equipmentPerformance = null
				const eq_check = await this.GET_EQUIPMENT_PERFORMANCE_EQ_ID(value.equip_id, req.site_id)
				if (eq_check) {
					equipmentPerformance = await EquipmentPerformance.query()
						.where((wh) => {
							wh.where('equip_id', value.equip_id)
							wh.where('period_date_start', SoM)
							wh.where('period_date_end', prevDate)
						})
						.last()
				}

				if (eq_check && !equipmentPerformance) {
					equipmentPerformance = await EquipmentPerformance.query()
						.where((wh) => {
							wh.where('equip_id', value.equip_id)
							wh.where('period_date_start', SoM)
						})
						.last()
				}

				if (eq_check) {
					const freq_bus = GET_COUNT_FREQ_BUS_EQUIPMENT(value.equip_id)
					const breakdown_hours_scheduled = (await GET_COUNT_SCHEDULED_BREAKDOWN('SCH', value.equip_id)) + equipmentPerformance.breakdown_hours_scheduled
					const breakdown_hours_unscheduled = (await GET_COUNT_SCHEDULED_BREAKDOWN('UNS', value.equip_id)) + equipmentPerformance.breakdown_hours_unscheduled
					const breakdown_hours_accident = (await GET_COUNT_SCHEDULED_BREAKDOWN('ACD', value.equip_id)) + equipmentPerformance.breakdown_hours_accident
					const breakdown_hours_total = breakdown_hours_scheduled + breakdown_hours_unscheduled + breakdown_hours_accident
					const last_freq_bus = equipmentPerformance.freq_bus
					const startDate = moment(equipmentPerformance.month).format('DD MMM')
					const nowDate = moment(selectedDate).format('DD MMM')
					const totalFreqBUS = last_freq_bus + freq_bus
					equipmentPerformance.merge({
						period: `${startDate} - ${nowDate}`,
						period_date_start: SoM,
						period_date_end: selectedDate,
						breakdown_hours_scheduled: breakdown_hours_scheduled,
						breakdown_hours_unscheduled: breakdown_hours_unscheduled,
						breakdown_hours_accident: breakdown_hours_accident,
						breakdown_hours_total: breakdown_hours_total,
						standby_hours: equipmentPerformance.mohh - (equipmentPerformance.work_hours + breakdown_hours_total),
						actual_pa: ((equipmentPerformance.mohh - breakdown_hours_total) / equipmentPerformance.mohh) * 100,
						breakdown_ratio_scheduled: (breakdown_hours_scheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
						breakdown_ratio_unscheduled: (breakdown_hours_unscheduled / (breakdown_hours_scheduled + breakdown_hours_unscheduled)) * 100 || 0,
						actual_mttr: !isFinite(breakdown_hours_unscheduled / totalFreqBUS) ? 0 : breakdown_hours_unscheduled / totalFreqBUS,
						freq_bus: totalFreqBUS,
					})

					try {
						await equipmentPerformance.save(trx)
						console.log(`---- success update data equipment performance : equip id ${value.equip_id} ----`)
					} catch (err) {
						await trx.rollback(trx)
						return {
							success: false,
							message: 'failed when updating eq.perf to database. Reason : \n' + err.message,
						}
					}
				}
			}
			await trx.commit(trx)

			try {
				if (dailyActivityEquipArr.length > 0) {
					for (const id of dailyActivityEquipArr) {
						await this.timesheetChecks(id, selectedDate, req.site_id, trx)
					}
					return {
						success: true,
						message: `Success upload daily downtime ${selectedDate}`,
					}
				} else {
					// do nothing
				}
			} catch (err) {
				await trx.rollback(trx)
				return {
					success: false,
					message: 'failed when when updating timesheet. Reason : \n' + err.message,
				}
			}
		} catch (err) {
			console.log('error daily downtime >> ', err)
			await trx.rollback(trx)
			return {
				success: false,
				message: 'failed upload daily downtime \n Reason : ' + err.message,
			}
		}
	}

	/**
	 * @description HOUR METER UPLOAD
	 */
	async uploadProcessHourMeter(req, filePath, user) {
		let trx = await db.beginTransaction()

		const sheet = req.sheet || 'DATABASE'

		const xlsx = excelToJson({
			sourceFile: filePath,
			header: 1,
		})

		const data = []
		const sheetData = xlsx[sheet].slice(2)
		const reqDate = moment(req.date).format('YYYY-MM-DD')
		const currentMonth = moment(reqDate).startOf('month').format('YYYY-MM-DD')
		const daysInMonth = moment(currentMonth).daysInMonth()
		const getTotalHours = daysInMonth * 24

		// methods
		const GET_EQUIPMENT_DATA = async (tipe, model, name) => {
			let result = null
			if (name) {
				const equipment = await MasEquipment.query().where('kode', name).last()
				if (equipment) {
					result = equipment.toJSON()
					return result
				} else {
					throw new Error(`Equipment Unit ${name} tidak di temukan pada master equipment...`)
				}
			}
		}

		const GET_STARTING_HOUR_METER_EQUIPMENT = async (equipId) => {
			if (equipId) {
				let getStartingHourMeterEquipment = await DailyChecklist.query(trx)
					.where((wh) => {
						wh.where('tgl', moment(reqDate).startOf('month').format('YYYY-MM-DD'))
						wh.where('unit_id', equipId)
					})
					.last()
				if (!getStartingHourMeterEquipment) {
					getStartingHourMeterEquipment = await DailyChecklist.query(trx)
						.where((wh) => {
							wh.where('unit_id', equipId)
						})
						.last()
				}
				return getStartingHourMeterEquipment || 0
			}
		}

		const GET_MTD_HOUR_METER_EQUIPMENT = async (equipId) => {
			if (equipId) {
				const start = moment(reqDate).startOf('month').format('YYYY-MM-DD')
				const end = moment(reqDate).endOf('month').format('YYYY-MM-DD')
				const equipment = await DailyChecklist.query()
					.where((wh) => {
						wh.where('tgl', '>=', start)
						wh.where('tgl', '<=', end)
						wh.where('unit_id', equipId)
					})
					.last()
				return equipment
			}
		}

		if (sheetData.length > 0) {
			for (const value of sheetData) {
				const date = moment(value.B).add(1, 'days').format('YYYY-MM-DD')
				if (date === reqDate) {
					const obj = {
						date: date,
						shift: value.C,
						equipName: value.H,
						equipModel: value.I,
						equipType: value.J,
						hm_start: value.M,
						hm_end: value.N,
						hm_total: value.O,
					}
					data.push(obj)
				}
			}

			const modelArr =
				`CAT 320GC,HITACHI ZX870LCH,SANY SY750H,SANY SY365H,DOOSAN DX800LC,SANY SY500H,HYUNDAI R210W-9S,HYUNDAI HX210S,CAT 395,CAT 330,SANY SY500H,D10R,CAT D9,CAT D6R2 XL,CAT D6GC,CAT 14M,SEM 921,SEM 922,CAT 773E,CMT96,TR50,A60D,FM260 JD,LS60HZ,HILIGHT V4,FM260 JD,T50,CF-48H-SS,LS60HZ,FUSO FN62,PF6TB-22,GEP33-3,SEM 636D,ATLAS COPCO XATS350,COMPACTOR CS11GC,Light Vehicle,KOMATSU375`.split(
					',',
				)

			for (const obj of data.filter((value) => value.equipName != undefined)) {
				try {
					const validEquipment = await MasEquipment.query().where('kode', obj.equipName).last()
					if (!validEquipment) {
						const newEquipment = new MasEquipment()
						// create the new equipment
						newEquipment.fill({
							kode: obj.equipName,
							site_id: req.site_id,
							tipe: (obj.equipType === 'OB HAULER' ? 'hauler truck' : obj.equipType?.toLowerCase()) || 'general support',
							brand: 'TEMP',
							received_date: reqDate,
							received_hm: '0',
							is_warranty: 'Y',
							warranty_date: reqDate,
							is_owned: 'Y',
							unit_sn: uid(6),
							unit_model: obj.equipModel || uid(6),
							engine_sn: uid(6),
							engine_model: 'TEMP',
							fuel_capacity: '0',
							qty_capacity: '0',
							satuan: 'MT',
							remark: 'created from daily hour meter upload ' + reqDate,
							created_by: user.id,
						})
						await newEquipment.save()

						const newEquipmentPerformance = new EquipmentPerformance()
						const now = moment(currentMonth).format('DD MMM')
						const to = moment(reqDate).format('DD MMM')

						if (modelArr.includes(newEquipment.unit_model)) {
							const checkEquipPerformance = await EquipmentPerformance.query()
								.where((wh) => {
									wh.where('month', currentMonth)
									wh.where('equip_id', newEquipment.id)
									wh.where('upload_by', user.id)
								})
								.last()

							if (!checkEquipPerformance) {
								newEquipmentPerformance.fill({
									month: currentMonth,
									period: `${now} - ${to}`,
									period_date_start: currentMonth,
									period_date_end: reqDate,
									equip_id: newEquipment.id,
									upload_by: user.id,
									mohh: getTotalHours,
									target_downtime_monthly: getTotalHours * (1 - 0 / 100), // default budget pa is 85
								})
								await newEquipmentPerformance.save()
							}
						}
					}
				} catch (error) {
					return {
						success: false,
						message: 'Failed when inserting new equipment kode ' + obj.equipName,
					}
				}
			}

			try {
				const shifts = (await MasShift.query(trx).fetch()).toJSON()

				// now insert the data to daily timesheet
				for (const value of data) {
					// get equipment id
					const equipId = (await GET_EQUIPMENT_DATA(value.equipType, value.equipModel, value.equipName)).id

					/** check if end hour meter is lower than start hour meter */
					if (value.hm_start && value.hm_end && value.hm_end < value.hm_start) {
						throw new Error(`Target Unit ${value.equipName} ${value.date} - ${value.shift} \n \n SMU Akhir tidak boleh lebih kecil dari SMU Awal, harap di cek lagi!`)
					}

					/** check if sheet index doesnt have value for start hour meter */
					if (!value.hm_start) {
						const equipId = (await GET_EQUIPMENT_DATA(null, null, value.equipName)).id
						const dailyChecklistCheck = await DailyChecklist.query()
							.where((wh) => {
								wh.where('unit_id', equipId)
							})
							.last()
						if (dailyChecklistCheck || dailyChecklistCheck.begin_smu) {
							value.hm_start = dailyChecklistCheck.begin_smu
						} else {
							throw new Error(`Target Unit ${value.equipName} ${value.date} - ${value.shift} \n \n SMU Awal Kosong, harap di isi terlebih dahulu!`)
						}
					}

					if (!value.hm_end) {
						throw new Error(`Target Unit ${value.equipName} ${value.date} - ${value.shift} \n \n SMU Akhir tidak ada nilainya, harap di isi SMU Akhirnya terlebih dahulu`)
					}

					/** check if start hour meter is lower than last hour meter */
					if (value.hm_start) {
						const getLastHMEquipment = await DailyChecklist.query()
							.where((wh) => {
								wh.where('unit_id', equipId)
							})
							.last()

						if (getLastHMEquipment && value.hm_start < getLastHMEquipment.end_smu) {
							getLastHMEquipment.merge({
								begin_smu: getLastHMEquipment.end_smu,
								end_smu: value.hm_end,
								used_smu: value.hm_end - getLastHMEquipment.end_smu,
							})
							await getLastHMEquipment.save(trx)
							// throw notification to user
							// throw new Error(`Target Unit ${value.equipName} ${value.date} - ${value.shift} \n \n SMU Awal tidak bisa kurang dari SMU Akhir, silahkan cek kembali SMU Awalnya! \n SMU Akhir di database : ${getLastHMEquipment.end_smu}`)
						}
					}

					try {
						/**
						 * Define the daily timesheet object
						 */

						if (equipId && value.hm_start) {
							const shiftID = (await this.GET_SHIFT_DATA(null, null, true, value.shift, reqDate)).id
							const dailyChecklistCheck = await DailyChecklist.query()
								.where((wh) => {
									wh.where('unit_id', equipId)
									wh.where('tgl', reqDate)
									wh.where('shift_id', shiftID)
								})
								.last()

							if (dailyChecklistCheck) {
								dailyChecklistCheck.merge({
									user_chk: user.id,
									user_spv: null,
									operator: null,
									unit_id: equipId,
									shift_id: (await this.GET_SHIFT_DATA(null, null, true, value.shift, reqDate)).id,
									dailyfleet_id: null,
									description: 'hm update from daily downtime',
									begin_smu: value.hm_start,
									end_smu: value.hm_end,
									used_smu: value.hm_total,
									tgl: reqDate,
									approved_at: (await this.GET_SHIFT_DATA(null, null, true, value.shift, reqDate)).start,
									finish_at: (await this.GET_SHIFT_DATA(null, null, true, value.shift, reqDate)).end,
								})
								await dailyChecklistCheck.save(trx)
								console.log('update timesheet id >> ', dailyChecklistCheck.id)
							} else {
								const newTimesheet = new DailyChecklist()
								newTimesheet.fill({
									user_chk: user.id,
									user_spv: null,
									operator: null,
									unit_id: equipId,
									shift_id: (await this.GET_SHIFT_DATA(null, null, true, value.shift, reqDate)).id,
									dailyfleet_id: null,
									description: 'hm upload from daily downtime',
									begin_smu: value.hm_start,
									end_smu: value.hm_end,
									used_smu: value.hm_total,
									tgl: reqDate,
									approved_at: (await this.GET_SHIFT_DATA(null, null, true, value.shift, reqDate)).start,
									finish_at: (await this.GET_SHIFT_DATA(null, null, true, value.shift, reqDate)).end,
								})
								await newTimesheet.save(trx)
								// save the daily time sheet
								console.log(`---- finished inserting timesheet id ${newTimesheet.id} ----`)
							}
						}
					} catch (err) {
						// if
						await trx.rollback(trx)
						return {
							success: false,
							message: 'Failed when inserting timesheet to tb.timesheet .\n Reason : ' + err.message,
							reason: err.message,
						}
					}

					try {
						const SMU_BEGIN = (await GET_STARTING_HOUR_METER_EQUIPMENT(equipId)).end_smu
						const SMU_MTD = (await GET_MTD_HOUR_METER_EQUIPMENT(equipId))?.end_smu
						const USED_SMU = SMU_MTD - SMU_BEGIN || 0

						/**
						 * MONTHLY PERFORMANCE
						 */
						// update equipment performance master
						const SoM = moment(reqDate).startOf('month').format('YYYY-MM-DD')
						let prevDate = null
						if (reqDate.split('-')[2] === '01') {
							prevDate = moment(reqDate).format('YYYY-MM-DD')
						} else {
							prevDate = moment(reqDate).subtract(1, 'day').format('YYYY-MM-DD')
						}

						const eq_check = await this.GET_EQUIPMENT_PERFORMANCE_EQ_ID(equipId, req.site_id)

						let equipmentPerformance = null
						if (eq_check) {
							equipmentPerformance = await EquipmentPerformance.query(trx)
								.where((wh) => {
									wh.where('equip_id', equipId)
									wh.where('period_date_start', SoM)
									wh.where('period_date_end', prevDate)
								})
								.last()
						}
						if (eq_check && !equipmentPerformance) {
							equipmentPerformance = await EquipmentPerformance.query(trx)
								.where((wh) => {
									wh.where('equip_id', equipId)
									wh.where('period_date_start', SoM)
								})
								.last()
						}

						if (eq_check && equipmentPerformance) {
							/**
							 * TODO
							 * Maybe check is infinite number or NaN
							 */
							const mtbs = await this.numberPrettier(!equipmentPerformance.freq_bus ? USED_SMU / USED_SMU : USED_SMU / equipmentPerformance.freq_bus)
							const mttr = !isFinite(equipmentPerformance.breakdown_hours_unscheduled / equipmentPerformance.freq_bus) ? 0 : equipmentPerformance.breakdown_hours_unscheduled / equipmentPerformance.freq_bus
							const sum_hm_bd_totals =
								equipmentPerformance.breakdown_hours_total + USED_SMU >= equipmentPerformance.mohh || equipmentPerformance.breakdown_hours_total >= equipmentPerformance.mohh
									? equipmentPerformance.breakdown_hours_total - USED_SMU
									: USED_SMU + equipmentPerformance.breakdown_hours_total
							const standby_hours = USED_SMU <= 0 ? 0 : equipmentPerformance.breakdown_hours_total >= equipmentPerformance.mohh || equipmentPerformance.mohh - sum_hm_bd_totals >= equipmentPerformance.mohh ? 0 : equipmentPerformance.mohh - sum_hm_bd_totals
							const actual_pa_non_percentage = equipmentPerformance.actual_pa / 100
							const actual_ma = USED_SMU ? USED_SMU / sum_hm_bd_totals : actual_pa_non_percentage / (actual_pa_non_percentage + equipmentPerformance.breakdown_hours_total)

							equipmentPerformance.merge({
								hm_reading_start: SMU_BEGIN,
								hm_reading_end: SMU_MTD,
								work_hours: USED_SMU,
								actual_eu: (USED_SMU / equipmentPerformance.mohh) * 100 || 0,
								actual_ua: (USED_SMU / (USED_SMU + standby_hours)) * 100 || 0,
								actual_ma: actual_ma * 100 || 0,
								standby_hours: standby_hours,
								actual_mtbs: mtbs,
								actual_mttr: mttr,
								description: equipmentPerformance.breakdown_hours_total + USED_SMU >= equipmentPerformance.mohh ? `HM is used while unit is breakdown for ${equipmentPerformance.breakdown_hours_total - USED_SMU} hours` : ' ',
							})

							try {
								await equipmentPerformance.save(trx)
							} catch (err) {
								await trx.rollback()
								return {
									success: false,
									message: `Failed when updating hm equipment \n Reason : ` + err.message,
								}
							}
							console.log(`---- finished update hm equipment ${value.equipName} ----`)
						}

						/**
						 * DAILY PERFORMANCE
						 */
						let dailyEquipPerformance = null

						if (eq_check) {
							dailyEquipPerformance = await EquipmentPerformanceDetails.query(trx)
								.where((wh) => {
									wh.where('date', reqDate)
									wh.where('equip_id', equipId)
								})
								.last()
						}

						if (eq_check && dailyEquipPerformance) {
							/**
							 * TODO
							 * Maybe check number is infinite or NaN
							 */
							const sum_hm_bd_totals =
								dailyEquipPerformance.breakdown_hours_total + value.hm_total >= dailyEquipPerformance.mohh || dailyEquipPerformance.breakdown_hours_total >= dailyEquipPerformance.mohh
									? dailyEquipPerformance.breakdown_hours_total - value.hm_total
									: value.hm_total + dailyEquipPerformance.breakdown_hours_total
							const mtbs = await this.numberPrettier(!dailyEquipPerformance.freq_bus ? value.hm_total / value.hm_total : value.hm_total / dailyEquipPerformance.freq_bus)
							const mttr = !isFinite(dailyEquipPerformance.breakdown_hours_unscheduled / dailyEquipPerformance.freq_bus) ? 0 : dailyEquipPerformance.breakdown_hours_unscheduled / dailyEquipPerformance.freq_bus
							const standby_hours = value.hm_total <= 0 ? 0 : dailyEquipPerformance.breakdown_hours_total >= dailyEquipPerformance.mohh || dailyEquipPerformance.mohh - sum_hm_bd_totals >= dailyEquipPerformance.mohh ? 0 : dailyEquipPerformance.mohh - sum_hm_bd_totals
							const actual_pa_non_percentage = dailyEquipPerformance.actual_pa / 100
							const actual_ma = value.hm_total ? value.hm_total / sum_hm_bd_totals : actual_pa_non_percentage / (actual_pa_non_percentage + dailyEquipPerformance.breakdown_hours_total)

							dailyEquipPerformance.merge({
								budget_pa: equipmentPerformance?.budget_pa || 0,
								hm_reading_start: value.hm_start,
								hm_reading_end: value.hm_end,
								work_hours: value.hm_total,
								actual_eu: (value.hm_total / dailyEquipPerformance.mohh) * 100 || 0,
								actual_ua: (value.hm_total / (value.hm_total + standby_hours)) * 100 || 0,
								actual_ma: actual_ma * 100 || 0,
								standby_hours: standby_hours,
								actual_mtbs: mtbs,
								actual_mttr: mttr,
								description: dailyEquipPerformance.breakdown_hours_total + value.hm_total >= dailyEquipPerformance.mohh ? `HM is used while unit is breakdown for ${dailyEquipPerformance.breakdown_hours_total - value.hm_total} hours` : ' ',
							})

							await dailyEquipPerformance.save(trx)
							console.log(`---- finished update hm equipment ${value.equipName} for daily ----`)
						}
					} catch (err) {
						await trx.rollback()
						console.log('error update eq.performance ?', err.message)
						return {
							success: false,
							message: 'Failed when updating timesheet to eq.performance .\n Reason : ' + err.message,
							reason: err.message,
						}
					}
				}

				// commit the transaction hour meter upload
				await trx.commit(trx)
				return {
					success: true,
					message: 'Finished upload hour meter.' + ' ' + reqDate,
				}
			} catch (err) {
				await trx.rollback(trx)
				return {
					success: true,
					message: 'Failed to upload hour meter. \n Reason : ' + err.message,
				}
			}
		}
	}

	async timesheetChecks(equipId, date, siteId, trx) {
		const GET_STARTING_HOUR_METER_EQUIPMENT = async (equipId) => {
			if (equipId) {
				let getStartingHourMeterEquipment = await DailyChecklist.query()
					.where((wh) => {
						wh.where('tgl', moment(date).startOf('month').format('YYYY-MM-DD'))
						wh.where('unit_id', equipId)
					})
					.last()
				if (!getStartingHourMeterEquipment) {
					getStartingHourMeterEquipment = await DailyChecklist.query()
						.where((wh) => {
							wh.where('unit_id', equipId)
						})
						.last()
				}
				return getStartingHourMeterEquipment || 0
			}
		}

		const GET_MTD_HOUR_METER_EQUIPMENT = async (equipId) => {
			if (equipId) {
				const start = moment(date).startOf('month').format('YYYY-MM-DD')
				const end = moment(date).endOf('month').format('YYYY-MM-DD')
				const equipment = await DailyChecklist.query()
					.where((wh) => {
						wh.where('tgl', '>=', start)
						wh.where('tgl', '<=', end)
						wh.where('unit_id', equipId)
					})
					.last()
				return equipment
			}
		}

		const GET_DAILY_HM = async (equipId) => {
			const shifts = (await MasShift.query().fetch()).toJSON()
			let begin_smu = 0
			let end_smu = 0
			let used_smu = 0

			const eq_timesheet_data = []

			for (const shift of shifts) {
				if (equipId) {
					const equipment = (
						await DailyChecklist.query()
							.where((wh) => {
								wh.where('tgl', date)
								wh.where('shift_id', shift.id)
								wh.where('unit_id', equipId)
							})
							.last()
					)?.toJSON()

					if (equipment) {
						eq_timesheet_data.push(equipment)
					}
				}
			}

			for (const value of eq_timesheet_data) {
				begin_smu += value.begin_smu
				end_smu += value.end_smu
				used_smu += value.used_smu
			}

			return {
				begin_smu,
				end_smu,
				used_smu,
			}
		}

		//
		const SMU_BEGIN = (await GET_STARTING_HOUR_METER_EQUIPMENT(equipId))?.end_smu
		const SMU_MTD = (await GET_MTD_HOUR_METER_EQUIPMENT(equipId))?.end_smu
		const USED_SMU = SMU_MTD - SMU_BEGIN || 0

		/**
		 * MONTHLY PERFORMANCE
		 */
		// update equipment performance master
		const SoM = moment(date).startOf('month').format('YYYY-MM-DD')
		let prevDate = null
		if (date.split('-')[2] === '01') {
			prevDate = moment(date).format('YYYY-MM-DD')
		} else {
			prevDate = moment(date).subtract(1, 'day').format('YYYY-MM-DD')
		}

		const eq_check = await this.GET_EQUIPMENT_PERFORMANCE_EQ_ID(equipId, siteId)

		let equipmentPerformance = null
		if (eq_check) {
			equipmentPerformance = await EquipmentPerformance.query()
				.where((wh) => {
					wh.where('equip_id', equipId)
					wh.where('period_date_start', SoM)
					wh.where('period_date_end', prevDate)
				})
				.last()
		}
		if (eq_check && !equipmentPerformance) {
			equipmentPerformance = await EquipmentPerformance.query()
				.where((wh) => {
					wh.where('equip_id', equipId)
					wh.where('period_date_start', SoM)
				})
				.last()
			// console.log('not found ?? ', equipmentPerformance)
		}

		if (equipmentPerformance) {
			/**
			 * TODO
			 * Maybe check if number is infinite or nan
			 */
			const mtbs = await this.numberPrettier(!equipmentPerformance.freq_bus ? USED_SMU / USED_SMU : USED_SMU / equipmentPerformance.freq_bus)
			const mttr = !isFinite(equipmentPerformance.breakdown_hours_unscheduled / equipmentPerformance.freq_bus) ? 0 : equipmentPerformance.breakdown_hours_unscheduled / equipmentPerformance.freq_bus
			const sum_hm_bd_totals =
				equipmentPerformance.breakdown_hours_total + USED_SMU >= equipmentPerformance.mohh || equipmentPerformance.breakdown_hours_total >= equipmentPerformance.mohh ? equipmentPerformance.breakdown_hours_total - USED_SMU : USED_SMU + equipmentPerformance.breakdown_hours_total
			const standby_hours = USED_SMU <= 0 ? 0 : equipmentPerformance.breakdown_hours_total >= equipmentPerformance.mohh || equipmentPerformance.mohh - sum_hm_bd_totals >= equipmentPerformance.mohh ? 0 : equipmentPerformance.mohh - sum_hm_bd_totals
			const actual_pa_non_percentage = equipmentPerformance.actual_pa / 100
			const actual_ma = USED_SMU ? USED_SMU / sum_hm_bd_totals : actual_pa_non_percentage / (actual_pa_non_percentage + equipmentPerformance.breakdown_hours_total)

			equipmentPerformance.merge({
				hm_reading_start: SMU_BEGIN,
				hm_reading_end: SMU_MTD,
				work_hours: USED_SMU,
				actual_eu: (USED_SMU / equipmentPerformance.mohh) * 100 || 0,
				actual_ua: (USED_SMU / (USED_SMU + standby_hours)) * 100 || 0,
				actual_ma: actual_ma * 100 || 0,
				standby_hours: standby_hours,
				actual_mtbs: mtbs,
				actual_mttr: mttr,
				description: equipmentPerformance.breakdown_hours_total + USED_SMU >= equipmentPerformance.mohh ? `HM is used while unit is breakdown for ${equipmentPerformance.breakdown_hours_total - USED_SMU} hours` : ' ',
			})

			try {
				await equipmentPerformance.save()
			} catch (err) {
				return {
					success: false,
					message: `Monthly equip performance update hm failed \n Reason : ` + err.message,
				}
			}
		}

		/**
		 * DAILY PERFORMANCE
		 */
		let dailyEquipPerformance = null

		if (eq_check) {
			dailyEquipPerformance = await EquipmentPerformanceDetails.query()
				.where((wh) => {
					wh.where('date', date)
					wh.where('equip_id', equipId)
					wh.where('site_id', siteId)
				})
				.last()
		}

		if (dailyEquipPerformance) {
			/**
			 * TODO
			 * Maybe check if number is infinite or nan
			 */
			// console.log('daily mohh >> ', dailyEquipPerformance.mohh);
			const daily_used_smu = (await GET_DAILY_HM(equipId)).used_smu
			const daily_begin_smu = (await GET_DAILY_HM(equipId)).begin_smu
			const daily_end_smu = (await GET_DAILY_HM(equipId)).end_smu
			// console.log('daily used smu >> ',daily_used_smu)
			// console.log('daily breakdown hours total >> ', dailyEquipPerformance.breakdown_hours_total);
			// console.log('\n\n')
			const sum_hm_bd_totals =
				dailyEquipPerformance.breakdown_hours_total + daily_used_smu >= dailyEquipPerformance.mohh || dailyEquipPerformance.breakdown_hours_total >= dailyEquipPerformance.mohh
					? dailyEquipPerformance.breakdown_hours_total - daily_used_smu
					: daily_used_smu + dailyEquipPerformance.breakdown_hours_total
			const mtbs = await this.numberPrettier(!dailyEquipPerformance.freq_bus ? daily_used_smu / daily_used_smu : daily_used_smu / dailyEquipPerformance.freq_bus)
			const mttr = !isFinite(dailyEquipPerformance.breakdown_hours_unscheduled / dailyEquipPerformance.freq_bus) ? 0 : dailyEquipPerformance.breakdown_hours_unscheduled / dailyEquipPerformance.freq_bus
			const standby_hours = daily_used_smu <= 0 ? 0 : dailyEquipPerformance.breakdown_hours_total >= dailyEquipPerformance.mohh || dailyEquipPerformance.mohh - sum_hm_bd_totals >= dailyEquipPerformance.mohh ? 0 : dailyEquipPerformance.mohh - sum_hm_bd_totals
			const actual_pa_non_percentage = dailyEquipPerformance.actual_pa / 100
			const actual_ma = daily_used_smu ? daily_used_smu / sum_hm_bd_totals : actual_pa_non_percentage / (actual_pa_non_percentage + dailyEquipPerformance.breakdown_hours_total)

			dailyEquipPerformance.merge({
				budget_pa: equipmentPerformance?.budget_pa || 0,
				hm_reading_start: daily_begin_smu,
				hm_reading_end: daily_end_smu,
				work_hours: daily_used_smu,
				actual_eu: (daily_used_smu / dailyEquipPerformance.mohh) * 100 || 0,
				actual_ua: (daily_used_smu / (daily_used_smu + standby_hours)) * 100 || 0,
				actual_ma: actual_ma * 100 || 0,
				standby_hours: standby_hours,
				actual_mttr: mttr,
				actual_mtbs: mtbs,
				description: dailyEquipPerformance.breakdown_hours_total + daily_used_smu >= dailyEquipPerformance.mohh ? `HM is used while unit is breakdown for ${dailyEquipPerformance.breakdown_hours_total - daily_used_smu} hours` : ' ',
			})

			try {
				await dailyEquipPerformance.save()
			} catch (err) {
				return {
					success: false,
					message: `Daily equip performance update hm failed \n Reason : ` + err.message,
				}
			}
		}
	}

	async GET_SHIFT_DATA(dateStart, dateEnd, byCode, code, dateNow) {
		let shiftData = null

		let shifts = null

		if (byCode) {
			shifts = await MasShift.query()
				.where((wh) => {
					wh.where('kode', code)
					wh.where('status', 'Y')
				})
				.last()
			const startShift = moment(`${dateNow} ${shifts.start_shift}`).format('YYYY-MM-DD HH:mm:ss')
			const endShift = moment(`${dateNow} ${shifts.start_shift}`).add(shifts.duration, 'hour').format('YYYY-MM-DD HH:mm:ss')
			shiftData = {
				id: shifts.id,
				start: startShift,
				end: endShift,
			}
		} else {
			shifts = await MasShift.query().where('status', 'Y')
			if (shifts.length > 0) {
				for (const shift of shifts) {
					const startShift = moment(`${dateStart} ${shift.start_shift}`).format('YYYY-MM-DD HH:mm:ss')
					const endShift = moment(`${dateStart} ${shift.start_shift}`).add(shift.duration, 'hour').format('YYYY-MM-DD HH:mm:ss')

					if (new Date(dateStart) >= new Date(startShift) && new Date(dateEnd) <= new dateEnd(endShift)) {
						shiftData = {
							id: shift.id,
							start: startShift,
							end: endShift,
						}
					}
				}
			}
		}

		return shiftData
	}

	async UPDATE_EQUIPMENT_MODEL(equipId, model) {
		const trx = await db.beginTransaction()
		let equipment = await MasEquipment.query()
			.where((wh) => {
				wh.where('id', equipId)
				wh.where('unit_model', model)
			})
			.last()
		if (!equipment) {
			equipment = await MasEquipment.query()
				.where((wh) => {
					wh.where('id', equipId)
				})
				.last()
			equipment.merge({
				unit_model: model,
			})
			await equipment.save(trx)
			await trx.commit(trx)
		}
	}

	async GET_EQUIPMENT_PERFORMANCE_EQ_ID(id, siteId) {
		const modelArr =
			`CAT 320GC,HITACHI ZX870LCH,SANY SY750H,SANY SY365H,DOOSAN DX800LC,SANY SY500H,HYUNDAI R210W-9S,HYUNDAI HX210S,CAT 395,CAT 330,SANY SY500H,D10R,CAT D9,CAT D6R2 XL,CAT D6GC,CAT 14M,SEM 921,SEM 922,CAT 773E,CMT96,TR50,A60D,FM260 JD,LS60HZ,HILIGHT V4,FM260 JD,T50,CF-48H-SS,LS60HZ,FUSO FN62,PF6TB-22,GEP33-3,SEM 636D,ATLAS COPCO XATS350,COMPACTOR CS11GC,Light Vehicle,KOMATSU375`.split(
				',',
			)

		let equipments = await MasEquipment.query()
			.where((wh) => {
				wh.whereIn('unit_model', modelArr)
				wh.where('site_id', siteId)
				wh.where('aktif', 'Y')
			})
			.fetch()

		if (equipments) {
			equipments = equipments.toJSON().map((v, i) => v.id)
		}

		let result = false

		if (equipments.includes(id)) {
			result = true
		} else {
			result = false
		}

		return result
	}

	async UPDATE_EQUIPMENT_PERFORMANCE_PERIOD(equipId, siteId, month, dateStart, dateEnd) {
		const eqPerf = await EquipmentPerformance.query()
			.where((wh) => {
				wh.where('equip_id', equipId)
				wh.where('site_id', siteId)
				wh.where('month', month)
			})
			.last()

		const dayStart = moment(dateStart).format('DD MMM')
		const dayEnd = moment(dateEnd).format('DD MMM')

		if (eqPerf) {
			eqPerf.merge({
				period: `${dayStart} - ${dayEnd}`,
				period_date_start: dateStart,
				period_date_end: dateEnd,
			})
			await eqPerf.save()

			console.log('update eq perf period')
		}
	}

	async numberPrettier(num) {
		let number = 0

		if (isNaN(num)) {
			return number
		}

		if (!isFinite(num)) {
			return number
		}

		return num
	}
}

module.exports = new DailyDowntime()
