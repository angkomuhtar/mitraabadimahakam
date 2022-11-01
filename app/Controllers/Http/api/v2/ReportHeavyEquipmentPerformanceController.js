'use strict'

const version = '2.0'
const fs = require('fs')
const _ = require('underscore')
const moment = require('moment')
const MasSite = use('App/Models/MasSite')
const { performance } = require('perf_hooks')
const diagnoticTime = use('App/Controllers/Http/customClass/diagnoticTime')
const MasEquipment = use('App/Models/MasEquipment')
const ReportPDFHelpers = use('App/Controllers/Http/Helpers/ReportPDF')
const ReportHeavyEquipment = use('App/Controllers/Http/Helpers/ReportHeavyEquipment')
const EquipmentPerformanceDetails = use('App/Models/MamEquipmentPerformanceDetails')
const DailyDowntimeEquipment = use('App/Models/DailyDowntimeEquipment')
var pdfMake = require('pdfmake/build/pdfmake.js')
var pdfFonts = require('pdfmake/build/vfs_fonts.js')
pdfMake.vfs = pdfFonts.pdfMake.vfs

class ReportHeavyEquipmentPerformanceController {
	async weekCheck(start, end) {
		const start_of_week = moment(start).startOf('week').format('YYYY-MM-DD')
		const start_of_week1 = moment(end).startOf('week').format('YYYY-MM-DD')
		const end_of_week = moment(end).endOf('week').format('YYYY-MM-DD')
		const week_arr = []
		// check if same week
		if (start_of_week1 === start_of_week) {
			const start = moment(start_of_week).format('YYYY-MM-DD')
			const end = moment(start_of_week).add(6, 'days').format('YYYY-MM-DD')
			const obj = {
				start: start,
				end: end,
				day: `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM')}`,
				data: {},
			}
			week_arr.push(obj)
		} else {
			const get_diff = moment(end_of_week).diff(start_of_week, 'days') + 1 // week
			const arrDate = Array.from({ length: get_diff }, (x, i) => moment(start_of_week).startOf('week').add(i, 'days').format('YYYY-MM-DD'))

			let start_of_week_array = []
			for (const value of arrDate) {
				const week_start = moment(value).startOf('week').format('YYYY-MM-DD')
				start_of_week_array.push(week_start)
			}
			start_of_week_array = _.uniq(start_of_week_array)
			for (const date of start_of_week_array) {
				const start = moment(date).format('YYYY-MM-DD')
				const end = moment(date).add(6, 'days').format('YYYY-MM-DD')
				const obj = {
					start: start,
					end: end,
					day: `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM')}`,
					data: {},
				}
				week_arr.push(obj)
			}
		}
		return week_arr || []
	}

	async monthCheck(start, end) {
		const start_of_month = moment(start).startOf('month').format('YYYY-MM-DD')
		const start_of_month1 = moment(end).startOf('month').format('YYYY-MM-DD')
		const end_of_month = moment(end).endOf('month').format('YYYY-MM-DD')
		const monthArr = []
		// check if same week
		if (start_of_month1 === start_of_month) {
			const start = moment(start_of_month).format('YYYY-MM-DD')
			const end = moment(start).endOf('month').format('YYYY-MM-DD')
			const obj = {
				start: start,
				end: end,
				day: `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM')}`,
				data: {},
			}
			monthArr.push(obj)
		} else {
			const get_diff = moment(end_of_month).diff(start_of_month, 'days') + 1 // week
			const arrDate = Array.from({ length: get_diff }, (x, i) => moment(start_of_month).startOf('month').add(i, 'days').format('YYYY-MM-DD'))
			let start_of_month_array = []
			for (const value of arrDate) {
				const month_start = moment(value).startOf('month').format('YYYY-MM-DD')
				start_of_month_array.push(month_start)
			}
			start_of_month_array = _.uniq(start_of_month_array)
			for (const date of start_of_month_array) {
				const start = moment(date).format('YYYY-MM-DD')
				const end = moment(date).endOf('months').format('YYYY-MM-DD')
				const obj = {
					start: start,
					end: end,
					day: `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM')}`,
					data: {},
				}
				monthArr.push(obj)
			}
		}
		return monthArr || []
	}

	async index({ auth, request, response }) {
		let data
		let durasi
		var t0 = performance.now()
		var req = request.all()
		// console.log(req);
		const user = await userValidate(auth)
		if (!user) {
			return response.status(403).json({
				diagnostic: {
					ver: version,
					error: true,
					message: 'not authorized...',
				},
			})
		}

		// let grafikPerformance = []
		// let dataPerformance = []

		// let grafikPieBreakdown = []
		// let dataPieBreakdown = []

		// let grafikDuration = []
		// let grafikEvent = []
		// let dataEvent = []

		if (req.inp_ranges === 'DAILY') {
			req.start_date = req.start
			req.end_date = req.end
			data = await ReportHeavyEquipment.DAILY(req)
		}

		if (req.inp_ranges === 'WEEKLY') {
			req.start_week = moment(req.start).format('YYYY-[W]ww')
			req.end_week = moment(req.end).format('YYYY-[W]ww')
			data = await ReportHeavyEquipment.WEEKLY(req)
		}

		if (req.inp_ranges === 'MONTHLY') {
			req.start_month = moment(req.start).startOf('month').format('YYYY-MM-DD')
			req.end_month = moment(req.end).endOf('month').format('YYYY-MM-DD')
			data = await ReportHeavyEquipment.MONTHLY(req)
		}
		const result = await BUILD_CHART(data)

		durasi = await diagnoticTime.durasi(t0)
		return response.status(200).json({
			diagnostic: {
				ver: version,
				times: durasi,
				error: false,
			},
			result,
		})
	}

	async pdf({ auth, request, response }) {
		let data
		let durasi
		var t0 = performance.now()
		var req = request.all()
		const user = await userValidate(auth)
		if (!user) {
			return response.status(403).json({
				diagnostic: {
					ver: version,
					error: true,
					message: 'not authorized...',
				},
			})
		}
		req.colorGraph = ['#7ab2fa', '#1074f7', '#0451b6']
		const site = await MasSite.query().where('id', req.site_id).last()
		var fileName = user.id + '-' + moment(req.start).format('YYMMDD') + '-' + moment(req.end).format('YYMMDD') + '-' + site.kode + '-' + req.range_type + '-' + req.inp_ranges

		try {
			if (fs.existsSync(`public/download/${fileName}.pdf`)) {
				fs.unlinkSync(`public/download/${fileName}.pdf`)
				console.log('SUCCESS DELETE FILES...')
			}
		} catch (err) {
			console.log('FAILED DELETE FILES...')
			console.error(err)
		}

		if (req.inp_ranges === 'DAILY') {
			req.start_date = req.start
			req.end_date = req.end
			data = await ReportHeavyEquipment.DAILY(req)
		}

		if (req.inp_ranges === 'WEEKLY') {
			req.start_week = moment(req.start).format('YYYY-[W]ww')
			req.end_week = moment(req.end).format('YYYY-[W]ww')
			data = await ReportHeavyEquipment.WEEKLY(req)
		}

		if (req.inp_ranges === 'MONTHLY') {
			req.start_month = moment(req.start).startOf('month').format('YYYY-MM-DD')
			req.end_month = moment(req.end).endOf('month').format('YYYY-MM-DD')
			data = await ReportHeavyEquipment.MONTHLY(req)

			const chartData = await BUILD_CHART(data)
			const { grafikPerformance } = chartData.data

			const myChart = new QuickChart()
			myChart.setConfig({
				type: 'bar',
				data: {
					labels: grafikPerformance.map((l) => l.label),
					datasets: [{ label: 'Foo', data: grafikPerformance.map((d) => (d.value != NaN ? d.value : 0)) }],
				},
			})
			// req.urlKPI = myChart.getUrl()

			if (data.success) {
				const result = await ReportPDFHelpers.KPI_PERFORMANCES(req, data)
				const pdfDocGenerator = pdfMake.createPdf(result)
				const pdfData = await BUILD_PDF(pdfDocGenerator)
				/* SAVING BASE64 TO FILE */
				var base64Data = pdfData.replace(/^data:application\/pdf;base64,/, '')
				let buff = Buffer.from(base64Data, 'base64')

				fs.writeFileSync(`public/download/${fileName}.pdf`, buff)
				durasi = await diagnoticTime.durasi(t0)
				return response.status(200).json({
					diagnostic: {
						ver: version,
						times: durasi,
						error: false,
					},
					data: {
						// site: site?.name,
						uri: `/download/${fileName}.pdf`,
						data: pdfData,
					},
				})
			}
			// console.log(pdfDocGenerator);
		}

		// return pdfDocGenerator
		// console.log('====================================');
		// console.log(data.byKPI);
		// console.log('====================================');
	}

	async equipmentList({ auth, request, response }) {
		var t0 = performance.now()
		// console.log(req);
		const user = await userValidate(auth)
		if (!user) {
			return response.status(403).json({
				diagnostic: {
					ver: version,
					error: true,
					message: 'not authorized...',
				},
			})
		}

		const { site_id } = request.all()
		const equipments = (
			await MasEquipment.query()
				.where((wh) => {
					wh.whereIn('tipe', ['excavator', 'general support', 'hauler truck', 'fuel truck', 'water truck', 'bulldozer', 'compaq', 'oth'])
					wh.where('aktif', 'Y')
					wh.where('site_id', site_id)
				})
				.fetch()
		).toJSON()

		const parsedEquipment = equipments.map((v) => {
			return {
				id: String(v.id),
				title: v.kode,
			}
		})

		return {
			data: parsedEquipment,
		}
	}

	async equipmentType({ auth, request, response }) {
		var t0 = performance.now()
		// console.log(req);
		const user = await userValidate(auth)
		if (!user) {
			return response.status(403).json({
				diagnostic: {
					ver: version,
					error: true,
					message: 'not authorized...',
				},
			})
		}

		const { site_id } = request.all()
		const equipments = (
			await MasEquipment.query()
				.where((wh) => {
					wh.whereIn('tipe', ['excavator', 'general support', 'hauler truck', 'fuel truck', 'water truck', 'bulldozer', 'compaq', 'oth'])
					wh.where('aktif', 'Y')
					wh.where('site_id', site_id)
				})
				.fetch()
		).toJSON()

		const parsedEquipment = _.uniq(equipments.map((v) => v.tipe)).map((v, i) => {
			return {
				id: i,
				title: v,
			}
		})

		return {
			data: parsedEquipment,
		}
	}

	async equipmentModel({ auth, request, response }) {
		var t0 = performance.now()
		// console.log(req);
		const user = await userValidate(auth)
		if (!user) {
			return response.status(403).json({
				diagnostic: {
					ver: version,
					error: true,
					message: 'not authorized...',
				},
			})
		}

		const modelArr =
			`CAT 320GC,HITACHI ZX870LCH,SANY SY750H,SANY SY365H,DOOSAN DX800LC,SANY SY500H,HYUNDAI R210W-9S,HYUNDAI HX210S,CAT 395,CAT 330,SANY SY500H,D10R,CAT D9,CAT D6R2 XL,CAT D6GC,CAT 14M,SEM 921,SEM 922,CAT 773E,CMT96,TR50,A60D,FM260 JD,LS60HZ,HILIGHT V4,FM260 JD,T50,CF-48H-SS,LS60HZ,FUSO FN62,PF6TB-22,GEP33-3,SEM 636D,ATLAS COPCO XATS350,COMPACTOR CS11GC,Light Vehicle,KOMATSU375`.split(
				',',
			)

		const { site_id } = request.all()
		const equipments = (
			await MasEquipment.query()
				.where((wh) => {
					wh.whereIn('unit_model', modelArr)
					wh.where('aktif', 'Y')
					wh.where('site_id', site_id)
				})
				.fetch()
		).toJSON()

		const parsedEquipment = _.uniq(equipments.map((v) => v.unit_model)).map((v, i) => {
			return {
				id: i,
				title: v,
			}
		})

		return {
			data: parsedEquipment,
		}
	}

	async GET_REPORT({ auth, request, response }) {
		var t0 = performance.now()
		var req = request.all()

		let equips = req.equip_id

		// report type checks
		if (req.report_type === 'single unit') {
			equips = [req.equip_id]
		}

		if (req.report_type === 'unit model') {
			const equipmentsModel = (
				await MasEquipment.query()
					.where((wh) => {
						wh.where('unit_model', req.equip_id)
						wh.where('site_id', req.site_id)
						wh.where('aktif', 'Y')
					})
					.fetch()
			).toJSON()
			if (equipmentsModel.length > 0) {
				equips = equipmentsModel.map((v) => v.id)
			}
		}

		if (req.report_type === 'unit type') {
			const equipmentsModel = (
				await MasEquipment.query()
					.where((wh) => {
						wh.where('tipe', req.equip_id)
						wh.where('site_id', req.site_id)
						wh.where('aktif', 'Y')
					})
					.fetch()
			).toJSON()
			if (equipmentsModel.length > 0) {
				equips = equipmentsModel.map((v) => v.id)
			}
		}
		// console.log(req);
		const user = await userValidate(auth)
		if (!user) {
			return response.status(403).json({
				diagnostic: {
					ver: version,
					error: true,
					message: 'not authorized...',
				},
			})
		}

		// DAILY REPORT SINGLE UNIT
		if (req.inp_ranges === 'DAILY' && req.report_type === 'single unit') {
			req.start_date = req.start
			req.end_date = req.end

			const dateStart = moment(req.start_date).format('YYYY-MM-DD')
			const dateEnd = moment(req.end_date).format('YYYY-MM-DD')

			const final_data = []
			const stoppages_duration_all = []
			const stoppages_event_all = []
			let stoppages_event = []

			// methods
			const GET_DATA_STOPPAGES = (componentName) => {
				let dur = 0

				let count = 0
				for (const value of stoppages_event) {
					if (value.name === componentName) {
						count += 1
						dur += value.duration
					}
				}

				return {
					total: count,
					duration: dur,
				}
			}

			const ep_details = (
				await EquipmentPerformanceDetails.query()
					.where((wh) => {
						wh.where('date', '>=', dateStart)
						wh.where('date', '<=', dateEnd)
						wh.where('site_id', req.site_id)
						wh.whereIn('equip_id', equips)
					})
					.orderBy('date', 'asc')
					.fetch()
			).toJSON()

			const daily_downtime = (
				await DailyDowntimeEquipment.query()
					.where((wh) => {
						wh.where('breakdown_start', '>=', dateStart)
						wh.where('breakdown_start', '<=', dateEnd)
						wh.whereIn('equip_id', equips)
						wh.where('component_group', '!=', 'Kosong')
					})
					.orderBy('urut', 'asc')
					.fetch()
			).toJSON()

			const arrComponent = `
            ENG	Engine
            UNC	Undercarriage
            TRN	Transmission
            HS	Hydraulic System
            ELS	Electrical System
            PM	Maintenance Program
            STR	Steering System
            BRS	Braking System
            RD	Radio comunication 
            CFP	Chassis, Frame, & panels
            ECS	Engine Cooling System
            AIS	Air Induction System
            FDR	Final Drive
            CAB	Cabin
            EFS	Engine Fuel System
            ACS	Air Conditioning System
            DIF	Differential 
            SUS	Suspension
            PT	Power train
            CIR	Circle
            GRS	Greasing System
            GET	GET
            BBT	Blade, Bucket, & Tray
            T	Tyre
            WRL	Work Lamp
            BOO	Boom
            SAF	Safety Devices
            SWS	Swing System`
				.split('\n')
				.map((v) => v.trim())
				.map((v) => v.replace('\t', ' '))
				.slice(1)
			if (daily_downtime.length > 0) {
				for (const data of daily_downtime) {
					stoppages_event.push({
						name: data.component_group,
						duration: data.downtime_total,
					})
				}

				for (const component of arrComponent) {
					const componentName = component.split(' ')[0]
					const obj1 = {
						label: componentName,
						value: GET_DATA_STOPPAGES(componentName).duration,
						frontColor: '#0096FF',
						longName: component,
					}
					const obj2 = {
						label: componentName,
						value: GET_DATA_STOPPAGES(componentName).total,
						frontColor: '#0096FF',
						longName: component,
					}

					stoppages_duration_all.push(obj1)
					stoppages_event_all.push(obj2)
				}
			}

			if (ep_details.length > 0) {
				const daily_ep_arr = []
				const daily_hm_arr = []
				const daily_breakdown_total = []
				const daily_breakdown_ratio = []
				const daily_actual_mean_time = []
				const daily_target_mean_time = []
				let ctx = 0
				for (const data of ep_details) {
					ctx += 1 // counter
					let obj1 = {} // pa
					let obj1_1 = {} // bpa
					let obj2 = {} // wh
					let obj2_1 = {} // std
					let obj3 = {
						// bd total
						stacks: [],
					}
					let obj4 = {} // bd ratio uns
					let obj4_1 = {} // bd ratio sch
					let obj5 = {} // actual mttr
					let obj5_1 = {} // target mttr
					let obj6 = {} // actual mtbs
					let obj6_1 = {} // target mtbs;

					const date = moment(data.date).format('DD/MM')
					// if (ctx % 2 === 0) {
					obj1 = { value: (data?.actual_pa || 0), frontColor: '#0096FF', desc: 'PA Actual', label: date, spacing: 20 }
					obj2 = { value: (data?.work_hours || 0), frontColor: '#fc0303', desc: 'Work Hours', spacing: 3 }
					obj4 = { value: (data?.breakdown_ratio_unscheduled || 0), frontColor: '#0096FF', desc: 'BD Ratio UNS', spacing: 3 }
					obj5 = { value: (data?.actual_mttr || 0), frontColor: '#0096FF', desc: 'Actual MTTR', spacing: 3 }
					obj6 = { value: (data?.actual_mtbs || 0), frontColor: '#0096FF', desc: 'Actual MTBS', spacing: 3 }
					// } else {
					obj1_1 = {
						value: (data?.budget_pa || 0),
						frontColor: '#fc0303',
						desc: 'PA Budget',
						spacing: 3,
					}
					obj2_1 = {
						value: (data?.standby_hours || 0),
						label: date,
						frontColor: '#0096FF',
						desc: 'Standby Hours',
						spacing: 20,
					}
					obj4_1 = { value: (data?.breakdown_ratio_scheduled || 0), frontColor: '#fc0303', label: date, desc: 'BD Ratio SCH', spacing: 20 }
					obj5_1 = { value: (data?.target_mttr || 0), label: date, frontColor: '#fc0303', desc: 'Target MTTR', spacing: 20 }
					obj6_1 = { value: (data?.target_mtbs || 0), label: date, frontColor: '#fc0303', desc: 'Target MTBS', spacing: 20 }
					// }
					obj3.stacks = [
						{ value: (data?.breakdown_hours_unscheduled || 0), color: '#e3fc03', desc: 'BD UNS' },
						{ value: (data?.breakdown_hours_scheduled || 0), color: '#0096FF', desc: 'BD SCH', marginBottom: 2 },
						{ value: (data?.breakdown_hours_accident || 0), color: '#3103fc', desc: 'BD ACD', marginBottom: 2 },
					]

					obj3['label'] = date
					// pa vs bpa
					daily_ep_arr.push(obj1_1)
					daily_ep_arr.push(obj1)
					// wh vs std
					daily_hm_arr.push(obj2)
					daily_hm_arr.push(obj2_1)
					// bd total
					daily_breakdown_total.push(obj3)
					// bd ratio uns vs sch
					daily_breakdown_ratio.push(obj4)
					daily_breakdown_ratio.push(obj4_1)
					// mttr vs mtbs
					daily_actual_mean_time.push(obj5)
					daily_actual_mean_time.push(obj5_1)
					daily_target_mean_time.push(obj6)
					daily_target_mean_time.push(obj6_1)
				}
				final_data.push({
					name: 'Budget PA vs Actual PA',
					data: daily_ep_arr,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#fc0303',
							text: 'Budget PA',
						},
						{
							color: '#0096FF',
							text: 'PA Actual',
						},
					],
				})
				final_data.push({
					name: 'Work Hour vs Standby Hour',
					data: daily_hm_arr,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'Standby Hour',
						},
						{
							color: '#fc0303',
							text: 'Work Hour',
						},
					],
				})
				final_data.push({
					name: 'Breakdown Summary',
					data: daily_breakdown_total,
					type: 'Stack Bar Chart',
					indicators: [
						{
							color: '#e3fc03',
							text: 'BD UNS',
						},
						{
							color: '#0096FF',
							text: 'BD SCH',
						},
						{
							color: '#3103fc',
							text: 'BD ACD',
						},
					],
				})
				final_data.push({
					name: 'Breakdown Ratio',
					data: daily_breakdown_ratio,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'BD Ratio UNS',
						},
						{
							color: '#fc0303',
							text: 'BD Ratio SCH',
						},
					],
				})
				final_data.push({
					name: 'MTTR',
					data: daily_actual_mean_time,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'Actual MTTR',
						},
						{
							color: '#fc0303',
							text: 'Target MTTR',
						},
					],
				})
				final_data.push({
					name: 'MTBS',
					data: daily_target_mean_time,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'Actual MTBS',
						},
						{
							color: '#fc0303',
							text: 'Target MTBS',
						},
					],
				})
			}

			const equip_performance_details = await EquipmentPerformanceDetails.query()
				.where((wh) => {
					wh.where('date', '>=', dateStart)
					wh.where('date', '<=', dateEnd)
					wh.where('site_id', req.site_id)
					wh.whereIn('equip_id', equips)
				})
				.orderBy('date', 'asc')
				.avg('actual_pa')
				.avg('budget_pa')
				.avg('actual_eu')
				.avg('actual_ma')
				.avg('actual_ua')
				.avg('actual_mttr')
				.avg('actual_mtbs')
				.avg('target_mttr')
				.avg('target_mtbs')
				.avg('breakdown_ratio_unscheduled')
				.avg('breakdown_ratio_scheduled')
				.avg('work_hours')
				.avg('standby_hours')
				.avg('breakdown_hours_accident')
				.avg('breakdown_hours_scheduled')
				.avg('breakdown_hours_unscheduled')

			const data = equip_performance_details[0]

			return {
				data: final_data,
				stoppages: {
					period: moment(req.start_date).format('DD MMM') + ' - ' + moment(req.end_date).format('DD MMM'),
					duration: stoppages_duration_all,
					totalEvent: stoppages_event_all,
				},
				summary: {
					avgActualPA: parseFloat(data['avg(`actual_pa`)']?.toFixed(2) || 0),
					avgBudgetPA: parseFloat(data['avg(`budget_pa`)']?.toFixed(2) || 0),
					avgActualEU: parseFloat(data['avg(`actual_eu`)']?.toFixed(2) || 0),
					avgActualMA: parseFloat(data['avg(`actual_ma`)']?.toFixed(2) || 0),
					avgActualUA: parseFloat(data['avg(`actual_ua`)']?.toFixed(2) || 0),
					avgWorkHours: parseFloat(data['avg(`work_hours`)']?.toFixed(2) || 0),
					avgStandbyHours: parseFloat(data['avg(`standby_hours`)']?.toFixed(2) || 0),
					avgBDRatioSCH: parseFloat(data['avg(`breakdown_ratio_scheduled`)']?.toFixed(2) || 0),
					avgBDRatioUNS: parseFloat(data['avg(`breakdown_ratio_unscheduled`)']?.toFixed(2) || 0),
					avgActualMTTR: parseFloat(data['avg(`actual_mttr`)']?.toFixed(2) || 0),
					avgActualMTBS: parseFloat(data['avg(`actual_mtbs`)']?.toFixed(2) || 0),
					avgBDHourACD: parseFloat(data['avg(`breakdown_hours_accident`)']?.toFixed(2) || 0),
					avgBDHourSCH: parseFloat(data['avg(`breakdown_hours_scheduled`)']?.toFixed(2) || 0),
					avgBDHourUNS: parseFloat(data['avg(`breakdown_hours_unscheduled`)']?.toFixed(2) || 0),
				},
			}
		}

		// DAILY REPORT UNIT MODEL & TYPE
		if (req.inp_ranges === 'DAILY' && (req.report_type === 'unit type' || req.report_type === 'unit model')) {
			req.start_date = req.start
			req.end_date = req.end

			const dateStart = moment(req.start_date).format('YYYY-MM-DD')
			const dateEnd = moment(req.end_date).format('YYYY-MM-DD')

			const final_data = []
			const stoppages_duration_all = []
			const stoppages_event_all = []
			let stoppages_event = []

			// methods
			const GET_DATA_STOPPAGES = (componentName) => {
				let dur = 0

				let count = 0
				for (const value of stoppages_event) {
					if (value.name === componentName) {
						count += 1
						dur += value.duration
					}
				}

				return {
					total: count,
					duration: dur,
				}
			}

			const getDaysCount = moment(dateEnd).diff(dateStart, 'days') + 1

			const days = Array.from({ length: getDaysCount }).map((v, i) => {
				return moment(dateStart).add(i, 'days').format('YYYY-MM-DD')
			})

			const daily_ep_arr = []
			const daily_hm_arr = []
			const daily_breakdown_total = []
			const daily_breakdown_ratio = []
			const daily_actual_mean_time = []
			const daily_target_mean_time = []

			for (const day of days) {
				const ep_details = await EquipmentPerformanceDetails.query()
					.where((wh) => {
						wh.where('date', day)
						wh.where('site_id', req.site_id)
						wh.whereIn('equip_id', equips)
					})
					.orderBy('date', 'asc')
					.avg('actual_pa')
					.avg('budget_pa')
					.avg('actual_eu')
					.avg('actual_mttr')
					.avg('actual_mtbs')
					.avg('target_mttr')
					.avg('target_mtbs')
					.avg('breakdown_ratio_unscheduled')
					.avg('breakdown_ratio_scheduled')
					.avg('work_hours')
					.avg('standby_hours')
					.avg('breakdown_hours_accident')
					.avg('breakdown_hours_scheduled')
					.avg('breakdown_hours_unscheduled')

				const data = ep_details[0]
				let obj1 = {} // pa
				let obj1_1 = {} // bpa
				let obj2 = {} // wh
				let obj2_1 = {} // std
				let obj3 = {
					// bd total
					stacks: [],
				}
				let obj4 = {} // bd ratio uns
				let obj4_1 = {} // bd ratio sch
				let obj5 = {} // actual mttr
				let obj5_1 = {} // target mttr
				let obj6 = {} // actual mtbs
				let obj6_1 = {} // target mtbs;

				const date = moment(day).format('DD/MM')
				// if (ctx % 2 === 0) {
				obj1 = { value: parseFloat(data['avg(`actual_pa`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'PA Actual', label: date }
				obj2 = { value: parseFloat(data['avg(`work_hours`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'Work Hours' }
				obj4 = { value: parseFloat(data['avg(`breakdown_ratio_scheduled`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'BD Ratio SCH' }
				obj5 = { value: parseFloat(data['avg(`actual_mttr`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'Actual MTTR' }
				obj6 = { value: parseFloat(data['avg(`actual_mtbs`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'Actual MTBS' }
				// } else {
				obj1_1 = {
					value: parseFloat(data['avg(`budget_pa`)']?.toFixed(2) || 0),
					frontColor: '#fc0303',
					desc: 'PA Budget',
				}
				obj2_1 = {
					value: parseFloat(data['avg(`standby_hours`)']?.toFixed(2) || 0),
					label: date,
					frontColor: '#fc0303',
					desc: 'Standby Hours',
				}
				obj4_1 = { value: parseFloat(data['avg(`breakdown_ratio_unscheduled`)']?.toFixed(2) || 0), frontColor: '#fc0303', label: date, desc: 'BD Ratio UNS' }
				obj5_1 = { value: parseFloat(data['avg(`target_mttr`)']?.toFixed(2) || 0), label: date, frontColor: '#fc0303', desc: 'Target MTTR' }
				obj6_1 = { value: parseFloat(data['avg(`target_mtbs`)']?.toFixed(2) || 0), label: date, frontColor: '#fc0303', desc: 'Target MTBS' }
				// }
				obj3.stacks = [
					{ value: parseFloat(data['avg(`breakdown_hours_unscheduled`)']?.toFixed(2) || 0), color: '#e3fc03', desc: 'BD UNS', label: date },
					{ value: parseFloat(data['avg(`breakdown_hours_scheduled`)']?.toFixed(2) || 0), color: '#0096FF', desc: 'BD SCH', marginBottom: 2, label: date },
					{ value: parseFloat(data['avg(`breakdown_hours_accident`)']?.toFixed(2) || 0), color: '#3103fc', desc: 'BD ACD', marginBottom: 2, label: date },
				]

				obj3['label'] = date
				// pa vs bpa
				daily_ep_arr.push(obj1_1)
				daily_ep_arr.push(obj1)
				// wh vs std
				daily_hm_arr.push(obj2)
				daily_hm_arr.push(obj2_1)
				// bd total
				daily_breakdown_total.push(obj3)
				// bd ratio uns vs sch
				daily_breakdown_ratio.push(obj4)
				daily_breakdown_ratio.push(obj4_1)
				// mttr vs mtbs
				daily_actual_mean_time.push(obj5)
				daily_actual_mean_time.push(obj5_1)
				daily_target_mean_time.push(obj6)
				daily_target_mean_time.push(obj6_1)
			}

			const daily_downtime = (
				await DailyDowntimeEquipment.query()
					.where((wh) => {
						wh.where('breakdown_start', '>=', dateStart)
						wh.where('breakdown_start', '<=', dateEnd)
						wh.whereIn('equip_id', equips)
						wh.where('component_group', '!=', 'Kosong')
					})
					.orderBy('urut', 'asc')
					.fetch()
			).toJSON()

			const arrComponent = `
            ENG	Engine
            UNC	Undercarriage
            TRN	Transmission
            HS	Hydraulic System
            ELS	Electrical System
            PM	Maintenance Program
            STR	Steering System
            BRS	Braking System
            RD	Radio comunication 
            CFP	Chassis, Frame, & panels
            ECS	Engine Cooling System
            AIS	Air Induction System
            FDR	Final Drive
            CAB	Cabin
            EFS	Engine Fuel System
            ACS	Air Conditioning System
            DIF	Differential 
            SUS	Suspension
            PT	Power train
            CIR	Circle
            GRS	Greasing System
            GET	GET
            BBT	Blade, Bucket, & Tray
            T	Tyre
            WRL	Work Lamp
            BOO	Boom
            SAF	Safety Devices
            SWS	Swing System`
				.split('\n')
				.map((v) => v.trim())
				.map((v) => v.replace('\t', ' '))
				.slice(1)
			if (daily_downtime.length > 0) {
				for (const data of daily_downtime) {
					stoppages_event.push({
						name: data.component_group,
						duration: data.downtime_total,
					})
				}

				for (const component of arrComponent) {
					const componentName = component.split(' ')[0]
					const obj1 = {
						label: componentName,
						value: GET_DATA_STOPPAGES(componentName).duration,
						frontColor: '#0096FF',
						longName: component,
					}
					const obj2 = {
						label: componentName,
						value: GET_DATA_STOPPAGES(componentName).total,
						frontColor: '#0096FF',
						longName: component,
					}

					stoppages_duration_all.push(obj1)
					stoppages_event_all.push(obj2)
				}
			}

			// push to array
			final_data.push({
				name: 'Budget PA vs Actual PA',
				data: daily_ep_arr,
				type: 'Bar Chart',
				indicators: [
					{
						color: '#fc0303',
						text: 'Budget PA',
					},
					{
						color: '#0096FF',
						text: 'PA Actual',
					},
				],
			})
			final_data.push({
				name: 'Work Hour vs Standby Hour',
				data: daily_hm_arr,
				type: 'Bar Chart',
				indicators: [
					{
						color: '#0096FF',
						text: 'Work Hour',
					},
					{
						color: '#fc0303',
						text: 'Standby Hour',
					},
				],
			})
			final_data.push({
				name: 'Breakdown Summary',
				data: daily_breakdown_total,
				type: 'Stack Bar Chart',
				indicators: [
					{
						color: '#e3fc03',
						text: 'BD UNS',
					},
					{
						color: '#0096FF',
						text: 'BD SCH',
					},
					{
						color: '#3103fc',
						text: 'BD ACD',
					},
				],
			})
			final_data.push({
				name: 'Breakdown Ratio',
				data: daily_breakdown_ratio,
				type: 'Bar Chart',
				indicators: [
					{
						color: '#0096FF',
						text: 'BD Ratio SCH',
					},
					{
						color: '#fc0303',
						text: 'BD Ratio UNS',
					},
				],
			})
			final_data.push({
				name: 'MTTR',
				data: daily_actual_mean_time,
				type: 'Bar Chart',
				indicators: [
					{
						color: '#0096FF',
						text: 'Actual MTTR',
					},
					{
						color: '#fc0303',
						text: 'Target MTTR',
					},
				],
			})
			final_data.push({
				name: 'MTBS',
				data: daily_target_mean_time,
				type: 'Bar Chart',
				indicators: [
					{
						color: '#0096FF',
						text: 'Actual MTBS',
					},
					{
						color: '#fc0303',
						text: 'Target MTBS',
					},
				],
			})

			const ep_details = await EquipmentPerformanceDetails.query()
				.where((wh) => {
					wh.where('date', '>=', dateStart)
					wh.where('date', '<=', dateEnd)
					wh.where('site_id', req.site_id)
					wh.whereIn('equip_id', equips)
				})
				.orderBy('date', 'asc')
				.avg('actual_pa')
				.avg('budget_pa')
				.avg('actual_eu')
				.avg('actual_ma')
				.avg('actual_ua')
				.avg('actual_mttr')
				.avg('actual_mtbs')
				.avg('target_mttr')
				.avg('target_mtbs')
				.avg('breakdown_ratio_unscheduled')
				.avg('breakdown_ratio_scheduled')
				.avg('work_hours')
				.avg('standby_hours')
				.avg('breakdown_hours_accident')
				.avg('breakdown_hours_scheduled')
				.avg('breakdown_hours_unscheduled')

			const data = ep_details[0]
			return {
				data: final_data,
				stoppages: {
					period: moment(req.start_date).format('DD MMM') + ' - ' + moment(req.end_date).format('DD MMM'),
					duration: stoppages_duration_all,
					totalEvent: stoppages_event_all,
				},
				summary: {
					avgActualPA: parseFloat(data['avg(`actual_pa`)']?.toFixed(2) || 0),
					avgBudgetPA: parseFloat(data['avg(`budget_pa`)']?.toFixed(2) || 0),
					avgActualEU: parseFloat(data['avg(`actual_eu`)']?.toFixed(2) || 0),
					avgActualMA: parseFloat(data['avg(`actual_ma`)']?.toFixed(2) || 0),
					avgActualUA: parseFloat(data['avg(`actual_ua`)']?.toFixed(2) || 0),
					avgWorkHours: parseFloat(data['avg(`work_hours`)']?.toFixed(2) || 0),
					avgStandbyHours: parseFloat(data['avg(`standby_hours`)']?.toFixed(2) || 0),
					avgBDRatioSCH: parseFloat(data['avg(`breakdown_ratio_scheduled`)']?.toFixed(2) || 0),
					avgBDRatioUNS: parseFloat(data['avg(`breakdown_ratio_unscheduled`)']?.toFixed(2) || 0),
					avgActualMTTR: parseFloat(data['avg(`actual_mttr`)']?.toFixed(2) || 0),
					avgActualMTBS: parseFloat(data['avg(`actual_mtbs`)']?.toFixed(2) || 0),
					avgBDHourACD: parseFloat(data['avg(`breakdown_hours_accident`)']?.toFixed(2) || 0),
					avgBDHourSCH: parseFloat(data['avg(`breakdown_hours_scheduled`)']?.toFixed(2) || 0),
					avgBDHourUNS: parseFloat(data['avg(`breakdown_hours_unscheduled`)']?.toFixed(2) || 0),
				},
			}
		}

		if (req.inp_ranges === 'WEEKLY') {
			req.start_week = moment(req.start).format('YYYY-MM-DD')
			req.end_week = moment(req.end).format('YYYY-MM-DD')
			// data = await ReportHeavyEquipment.WEEKLY(req)

			const weekRanges = await this.weekCheck(req.start_week, req.end_week)

			const final_data = []
			const stoppages_duration_all = []
			const stoppages_event_all = []
			let stoppages_event = []

			if (weekRanges.length > 0) {
				let ctx = 0

				// equipment performance
				const daily_ep_arr = []
				const daily_hm_arr = []
				const daily_breakdown_total = []
				const daily_breakdown_ratio = []
				const daily_actual_mean_time = []
				const daily_target_mean_time = []

				for (const week of weekRanges) {
					const ep_details = await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', week.start)
							wh.where('date', '<=', week.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.avg('actual_pa')
						.avg('budget_pa')
						.avg('actual_eu')
						.avg('actual_mttr')
						.avg('actual_mtbs')
						.avg('target_mttr')
						.avg('target_mtbs')
						.avg('breakdown_ratio_unscheduled')
						.avg('breakdown_ratio_scheduled')

					const work_hours_total_in_a_week = await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', week.start)
							wh.where('date', '<=', week.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.getSum('work_hours') || 0

					const standby_hours_total_in_a_week = await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', week.start)
							wh.where('date', '<=', week.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.getSum('standby_hours') || 0

					const breakdown_hours_accident_total_in_a_week = await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', week.start)
							wh.where('date', '<=', week.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.getSum('breakdown_hours_accident') || 0

					const breakdown_hours_scheduled_total_in_a_week = await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', week.start)
							wh.where('date', '<=', week.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.getSum('breakdown_hours_scheduled') || 0

					const breakdown_hours_unscheduled_total_in_a_week = await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', week.start)
							wh.where('date', '<=', week.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.getSum('breakdown_hours_unscheduled') || 0

					const daily_downtime = (
						await DailyDowntimeEquipment.query()
							.where((wh) => {
								wh.where('breakdown_start', '>=', week.start)
								wh.where('breakdown_start', '<=', week.end)
								wh.whereIn('equip_id', equips)
								wh.where('component_group', '!=', 'Kosong')
							})
							.orderBy('urut', 'asc')
							.fetch()
					).toJSON()

					// event stoppages
					if (daily_downtime.length > 0) {
						for (const data of daily_downtime) {
							stoppages_event.push({
								name: data.component_group,
								duration: data.downtime_total,
							})
						}
					}

					ctx += 1 // counter
					let obj1 = {} // pa
					let obj1_1 = {} // bpa
					let obj2 = {} // wh
					let obj2_1 = {} // std
					let obj3 = {
						// bd total
						stacks: [],
					}
					let obj4 = {} // bd ratio uns
					let obj4_1 = {} // bd ratio sch
					let obj5 = {} // actual mttr
					let obj5_1 = {} // target mttr
					let obj6 = {} // actual mtbs
					let obj6_1 = {} // target mtbs;

					// if (ctx % 2 === 0) {
					obj1 = { value: parseFloat(ep_details[0]['avg(`actual_pa`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'PA Actual', label: week.day }
					obj2 = { value: parseFloat(work_hours_total_in_a_week?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'Work Hours' }
					obj4 = { value: parseFloat(ep_details[0]['avg(`breakdown_ratio_scheduled`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'BD Ratio SCH' }
					obj5 = { value: parseFloat(ep_details[0]['avg(`actual_mttr`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'Actual MTTR' }
					obj6 = { value: parseFloat(ep_details[0]['avg(`actual_mtbs`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'Actual MTBS' }
					// } else {
					obj1_1 = {
						value: parseFloat(ep_details[0]['avg(`budget_pa`)']?.toFixed(2) || 0),
						frontColor: '#fc0303',
						desc: 'PA Budget',
					}
					obj2_1 = {
						value: parseFloat(standby_hours_total_in_a_week?.toFixed(2) || 0),
						label: week.day,
						frontColor: '#fc0303',
						desc: 'Standby Hours',
					}
					obj4_1 = { value: parseFloat(ep_details[0]['avg(`breakdown_ratio_unscheduled`)']?.toFixed(2) || 0), frontColor: '#fc0303', label: week.day, desc: 'BD Ratio UNS' }
					obj5_1 = { value: parseFloat(ep_details[0]['avg(`target_mttr`)']?.toFixed(2) || 0), label: week.day, frontColor: '#fc0303', desc: 'Target MTTR' }
					obj6_1 = { value: parseFloat(ep_details[0]['avg(`target_mtbs`)']?.toFixed(2) || 0), label: week.day, frontColor: '#fc0303', desc: 'Target MTBS' }
					// }
					obj3.stacks = [
						{ value: parseFloat(breakdown_hours_unscheduled_total_in_a_week?.toFixed(2) || 0), color: '#e3fc03', desc: 'BD UNS', label: week.day },
						{ value: parseFloat(breakdown_hours_scheduled_total_in_a_week?.toFixed(2) || 0), color: '#0096FF', desc: 'BD SCH', marginBottom: 2, label: week.day },
						{ value: parseFloat(breakdown_hours_accident_total_in_a_week?.toFixed(2) || 0), color: '#3103fc', desc: 'BD ACD', marginBottom: 2, label: week.day },
					]

					obj3['label'] = `${moment(week.start).format('DD')}-${moment(week.end).format('DD')}`
					// pa vs bpa
					daily_ep_arr.push(obj1_1)
					daily_ep_arr.push(obj1)
					// wh vs std
					daily_hm_arr.push(obj2)
					daily_hm_arr.push(obj2_1)
					// bd total
					daily_breakdown_total.push(obj3)
					// bd ratio uns vs sch
					daily_breakdown_ratio.push(obj4)
					daily_breakdown_ratio.push(obj4_1)
					// mttr vs mtbs
					daily_actual_mean_time.push(obj5)
					daily_actual_mean_time.push(obj5_1)
					daily_target_mean_time.push(obj6)
					daily_target_mean_time.push(obj6_1)
				}

				// methods
				const GET_DATA_STOPPAGES = (componentName) => {
					let dur = 0
					let count = 0

					for (const value of stoppages_event) {
						if (value.name === componentName) {
							count += 1
							dur += value.duration
						}
					}
					return {
						total: count,
						duration: dur,
					}
				}

				// stoppages loop
				const arrComponent = `
				ENG	Engine
				UNC	Undercarriage
				TRN	Transmission
				HS	Hydraulic System
				ELS	Electrical System
				PM	Maintenance Program
				STR	Steering System
				BRS	Braking System
				RD	Radio comunication 
				CFP	Chassis, Frame, & panels
				ECS	Engine Cooling System
				AIS	Air Induction System
				FDR	Final Drive
				CAB	Cabin
				EFS	Engine Fuel System
				ACS	Air Conditioning System
				DIF	Differential 
				SUS	Suspension
				PT	Power train
				CIR	Circle
				GRS	Greasing System
				GET	GET
				BBT	Blade, Bucket, & Tray
				T	Tyre
				WRL	Work Lamp
				BOO	Boom
				SAF	Safety Devices
				SWS	Swing System`
					.split('\n')
					.map((v) => v.trim())
					.map((v) => v.replace('\t', ' '))
					.slice(1)

				for (const component of arrComponent) {
					const componentName = component.split(' ')[0]
					const obj1 = {
						label: componentName,
						value: parseFloat(GET_DATA_STOPPAGES(componentName).duration?.toFixed(2) || 0),
						frontColor: '#0096FF',
						longName: component,
					}
					const obj2 = {
						label: componentName,
						value: parseFloat(GET_DATA_STOPPAGES(componentName).total?.toFixed(2) || 0),
						frontColor: '#0096FF',
						longName: component,
					}
					stoppages_duration_all.push(obj1)
					stoppages_event_all.push(obj2)
				}
				final_data.push({
					name: 'Budget PA vs Actual PA',
					data: daily_ep_arr,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'PA Actual',
						},
						{
							color: '#fc0303',
							text: 'Budget PA',
						},
					],
				})
				final_data.push({
					name: 'Work Hour vs Standby Hour',
					data: daily_hm_arr,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'Work Hour',
						},
						{
							color: '#fc0303',
							text: 'Standby Hour',
						},
					],
				})
				final_data.push({
					name: 'Breakdown Summary',
					data: daily_breakdown_total,
					type: 'Stack Bar Chart',
					indicators: [
						{
							color: '#e3fc03',
							text: 'BD UNS',
						},
						{
							color: '#0096FF',
							text: 'BD SCH',
						},
						{
							color: '#3103fc',
							text: 'BD ACD',
						},
					],
				})
				final_data.push({
					name: 'Breakdown Ratio',
					data: daily_breakdown_ratio,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'BD Ratio SCH',
						},
						{
							color: '#fc0303',
							text: 'BD Ratio UNS',
						},
					],
				})
				final_data.push({
					name: 'MTTR',
					data: daily_actual_mean_time,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'Actual MTTR',
						},
						{
							color: '#fc0303',
							text: 'Target MTTR',
						},
					],
				})
				final_data.push({
					name: 'MTBS',
					data: daily_target_mean_time,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'Actual MTBS',
						},
						{
							color: '#fc0303',
							text: 'Target MTBS',
						},
					],
				})

				const ep_details = await EquipmentPerformanceDetails.query()
					.where((wh) => {
						wh.where('date', '>=', moment(req.start_week).startOf('week').format('YYYY-MM-DD'))
						wh.where('date', '<=', moment(req.end_week).endOf('week').format('YYYY-MM-DD'))
						wh.where('site_id', req.site_id)
						wh.whereIn('equip_id', equips)
					})
					.orderBy('date', 'asc')
					.avg('actual_pa')
					.avg('budget_pa')
					.avg('actual_eu')
					.avg('actual_ma')
					.avg('actual_ua')
					.avg('actual_mttr')
					.avg('actual_mtbs')
					.avg('target_mttr')
					.avg('target_mtbs')
					.avg('breakdown_ratio_unscheduled')
					.avg('breakdown_ratio_scheduled')
					.avg('work_hours')
					.avg('standby_hours')
					.avg('breakdown_hours_accident')
					.avg('breakdown_hours_scheduled')
					.avg('breakdown_hours_unscheduled')

				const data = ep_details[0]

				return {
					data: final_data,
					stoppages: {
						period: moment(req.start_week).startOf('week').format('DD MMM') + ' - ' + moment(req.end_week).endOf('week').format('DD MMM'),
						duration: stoppages_duration_all,
						totalEvent: stoppages_event_all,
					},
					summary: {
						avgActualPA: parseFloat(data['avg(`actual_pa`)']?.toFixed(2) || 0),
						avgBudgetPA: parseFloat(data['avg(`budget_pa`)']?.toFixed(2) || 0),
						avgActualEU: parseFloat(data['avg(`actual_eu`)']?.toFixed(2) || 0),
						avgActualMA: parseFloat(data['avg(`actual_ma`)']?.toFixed(2) || 0),
						avgActualUA: parseFloat(data['avg(`actual_ua`)']?.toFixed(2) || 0),
						avgWorkHours: parseFloat(data['avg(`work_hours`)']?.toFixed(2) || 0),
						avgStandbyHours: parseFloat(data['avg(`standby_hours`)']?.toFixed(2) || 0),
						avgBDRatioSCH: parseFloat(data['avg(`breakdown_ratio_scheduled`)']?.toFixed(2) || 0),
						avgBDRatioUNS: parseFloat(data['avg(`breakdown_ratio_unscheduled`)']?.toFixed(2) || 0),
						avgActualMTTR: parseFloat(data['avg(`actual_mttr`)']?.toFixed(2) || 0),
						avgActualMTBS: parseFloat(data['avg(`actual_mtbs`)']?.toFixed(2) || 0),
						avgBDHourACD: parseFloat(data['avg(`breakdown_hours_accident`)']?.toFixed(2) || 0),
						avgBDHourSCH: parseFloat(data['avg(`breakdown_hours_scheduled`)']?.toFixed(2) || 0),
						avgBDHourUNS: parseFloat(data['avg(`breakdown_hours_unscheduled`)']?.toFixed(2) || 0),
					},
				}
			} else {
				return {
					sucess: false,
					data: [],
				}
			}
		}

		if (req.inp_ranges === 'MONTHLY') {
			req.start_month = moment(req.start).startOf('month').format('YYYY-MM-DD')
			req.end_month = moment(req.end).endOf('month').format('YYYY-MM-DD')

			// todo

			const months = await this.monthCheck(req.start_month, req.end_month);

			const final_data = []
			const stoppages_duration_all = []
			const stoppages_event_all = []
			let stoppages_event = []

			if (months.length > 0) {
				let ctx = 0

				// equipment performance
				const daily_ep_arr = []
				const daily_hm_arr = []
				const daily_breakdown_total = []
				const daily_breakdown_ratio = []
				const daily_actual_mean_time = []
				const daily_target_mean_time = []

				for (const month of months) {
					const ep_details = await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', month.start)
							wh.where('date', '<=', month.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.avg('actual_pa')
						.avg('budget_pa')
						.avg('actual_eu')
						.avg('actual_mttr')
						.avg('actual_mtbs')
						.avg('target_mttr')
						.avg('target_mtbs')
						.avg('breakdown_ratio_unscheduled')
						.avg('breakdown_ratio_scheduled')

					const work_hours_total_in_a_month= await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', month.start)
							wh.where('date', '<=', month.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.getSum('work_hours') || 0

					const standby_hours_total_in_a_month = await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', month.start)
							wh.where('date', '<=', month.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.getSum('standby_hours') || 0

					const breakdown_hours_accident_total_in_a_month = await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', month.start)
							wh.where('date', '<=', month.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.getSum('breakdown_hours_accident') || 0

					const breakdown_hours_scheduled_total_in_a_month = await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', month.start)
							wh.where('date', '<=', month.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.getSum('breakdown_hours_scheduled') || 0

					const breakdown_hours_unscheduled_total_in_a_month = await EquipmentPerformanceDetails.query()
						.where((wh) => {
							wh.where('date', '>=', month.start)
							wh.where('date', '<=', month.end)
							wh.where('site_id', req.site_id)
							wh.whereIn('equip_id', equips)
						})
						.orderBy('date', 'asc')
						.getSum('breakdown_hours_unscheduled') || 0

					const daily_downtime = (
						await DailyDowntimeEquipment.query()
							.where((wh) => {
								wh.where('breakdown_start', '>=', month.start)
								wh.where('breakdown_start', '<=', month.end)
								wh.whereIn('equip_id', equips)
								wh.where('component_group', '!=', 'Kosong')
							})
							.orderBy('urut', 'asc')
							.fetch()
					).toJSON() || []

					// event stoppages
					if (daily_downtime.length > 0) {
						for (const data of daily_downtime) {
							stoppages_event.push({
								name: data.component_group,
								duration: data.downtime_total,
							})
						}
					}

					ctx += 1 // counter
					let obj1 = {} // pa
					let obj1_1 = {} // bpa
					let obj2 = {} // wh
					let obj2_1 = {} // std
					let obj3 = {
						// bd total
						stacks: [],
					}
					let obj4 = {} // bd ratio uns
					let obj4_1 = {} // bd ratio sch
					let obj5 = {} // actual mttr
					let obj5_1 = {} // target mttr
					let obj6 = {} // actual mtbs
					let obj6_1 = {} // target mtbs;

					// if (ctx % 2 === 0) {
					obj1 = { value: parseFloat(ep_details[0]['avg(`actual_pa`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'PA Actual', label: month.day }
					obj2 = { value: parseFloat(work_hours_total_in_a_month?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'Work Hours' }
					obj4 = { value: parseFloat(ep_details[0]['avg(`breakdown_ratio_scheduled`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'BD Ratio SCH' }
					obj5 = { value: parseFloat(ep_details[0]['avg(`actual_mttr`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'Actual MTTR' }
					obj6 = { value: parseFloat(ep_details[0]['avg(`actual_mtbs`)']?.toFixed(2) || 0), frontColor: '#0096FF', desc: 'Actual MTBS' }
					// } else {
					obj1_1 = {
						value: parseFloat(ep_details[0]['avg(`budget_pa`)']?.toFixed(2) || 0),
						frontColor: '#fc0303',
						desc: 'PA Budget',
					}
					obj2_1 = {
						value: parseFloat(standby_hours_total_in_a_month?.toFixed(2) || 0),
						label: month.day,
						frontColor: '#fc0303',
						desc: 'Standby Hours',
					}
					obj4_1 = { value: parseFloat(ep_details[0]['avg(`breakdown_ratio_unscheduled`)']?.toFixed(2) || 0), frontColor: '#fc0303', label: month.day, desc: 'BD Ratio UNS' }
					obj5_1 = { value: parseFloat(ep_details[0]['avg(`target_mttr`)']?.toFixed(2) || 0), label: month.day, frontColor: '#fc0303', desc: 'Target MTTR' }
					obj6_1 = { value: parseFloat(ep_details[0]['avg(`target_mtbs`)']?.toFixed(2) || 0), label: month.day, frontColor: '#fc0303', desc: 'Target MTBS' }
					// }
					obj3.stacks = [
						{ value: parseFloat(breakdown_hours_unscheduled_total_in_a_month?.toFixed(2) || 0), color: '#e3fc03', desc: 'BD UNS', label: month.day },
						{ value: parseFloat(breakdown_hours_scheduled_total_in_a_month?.toFixed(2) || 0), color: '#0096FF', desc: 'BD SCH', marginBottom: 2, label: month.day },
						{ value: parseFloat(breakdown_hours_accident_total_in_a_month?.toFixed(2) || 0), color: '#3103fc', desc: 'BD ACD', marginBottom: 2, label: month.day },
					]

					obj3['label'] = `${moment(month.start).format('DD')}-${moment(month.end).format('DD')}`
					// pa vs bpa
					daily_ep_arr.push(obj1_1)
					daily_ep_arr.push(obj1)
					// wh vs std
					daily_hm_arr.push(obj2)
					daily_hm_arr.push(obj2_1)
					// bd total
					daily_breakdown_total.push(obj3)
					// bd ratio uns vs sch
					daily_breakdown_ratio.push(obj4)
					daily_breakdown_ratio.push(obj4_1)
					// mttr vs mtbs
					daily_actual_mean_time.push(obj5)
					daily_actual_mean_time.push(obj5_1)
					daily_target_mean_time.push(obj6)
					daily_target_mean_time.push(obj6_1)
				}

				// methods
				const GET_DATA_STOPPAGES = (componentName) => {
					let dur = 0
					let count = 0

					for (const value of stoppages_event) {
						if (value.name === componentName) {
							count += 1
							dur += value.duration
						}
					}
					return {
						total: count,
						duration: dur,
					}
				}

				// stoppages loop
				const arrComponent = `
				ENG	Engine
				UNC	Undercarriage
				TRN	Transmission
				HS	Hydraulic System
				ELS	Electrical System
				PM	Maintenance Program
				STR	Steering System
				BRS	Braking System
				RD	Radio comunication 
				CFP	Chassis, Frame, & panels
				ECS	Engine Cooling System
				AIS	Air Induction System
				FDR	Final Drive
				CAB	Cabin
				EFS	Engine Fuel System
				ACS	Air Conditioning System
				DIF	Differential 
				SUS	Suspension
				PT	Power train
				CIR	Circle
				GRS	Greasing System
				GET	GET
				BBT	Blade, Bucket, & Tray
				T	Tyre
				WRL	Work Lamp
				BOO	Boom
				SAF	Safety Devices
				SWS	Swing System`
					.split('\n')
					.map((v) => v.trim())
					.map((v) => v.replace('\t', ' '))
					.slice(1)

				for (const component of arrComponent) {
					const componentName = component.split(' ')[0]
					const obj1 = {
						label: componentName,
						value: parseFloat(GET_DATA_STOPPAGES(componentName).duration?.toFixed(2) || 0),
						frontColor: '#0096FF',
						longName: component,
					}
					const obj2 = {
						label: componentName,
						value: parseFloat(GET_DATA_STOPPAGES(componentName).total?.toFixed(2) || 0),
						frontColor: '#0096FF',
						longName: component,
					}
					stoppages_duration_all.push(obj1)
					stoppages_event_all.push(obj2)
				}
				final_data.push({
					name: 'Budget PA vs Actual PA',
					data: daily_ep_arr,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'PA Actual',
						},
						{
							color: '#fc0303',
							text: 'Budget PA',
						},
					],
				})
				final_data.push({
					name: 'Work Hour vs Standby Hour',
					data: daily_hm_arr,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'Work Hour',
						},
						{
							color: '#fc0303',
							text: 'Standby Hour',
						},
					],
				})
				final_data.push({
					name: 'Breakdown Summary',
					data: daily_breakdown_total,
					type: 'Stack Bar Chart',
					indicators: [
						{
							color: '#e3fc03',
							text: 'BD UNS',
						},
						{
							color: '#0096FF',
							text: 'BD SCH',
						},
						{
							color: '#3103fc',
							text: 'BD ACD',
						},
					],
				})
				final_data.push({
					name: 'Breakdown Ratio',
					data: daily_breakdown_ratio,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'BD Ratio SCH',
						},
						{
							color: '#fc0303',
							text: 'BD Ratio UNS',
						},
					],
				})
				final_data.push({
					name: 'MTTR',
					data: daily_actual_mean_time,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'Actual MTTR',
						},
						{
							color: '#fc0303',
							text: 'Target MTTR',
						},
					],
				})
				final_data.push({
					name: 'MTBS',
					data: daily_target_mean_time,
					type: 'Bar Chart',
					indicators: [
						{
							color: '#0096FF',
							text: 'Actual MTBS',
						},
						{
							color: '#fc0303',
							text: 'Target MTBS',
						},
					],
				})

				const ep_details = await EquipmentPerformanceDetails.query()
					.where((wh) => {
						wh.where('date', '>=', moment(req.start_month).startOf('month').format('YYYY-MM-DD'))
						wh.where('date', '<=', moment(req.end_month).endOf('month').format('YYYY-MM-DD'))
						wh.where('site_id', req.site_id)
						wh.whereIn('equip_id', equips)
					})
					.orderBy('date', 'asc')
					.avg('actual_pa')
					.avg('budget_pa')
					.avg('actual_eu')
					.avg('actual_ma')
					.avg('actual_ua')
					.avg('actual_mttr')
					.avg('actual_mtbs')
					.avg('target_mttr')
					.avg('target_mtbs')
					.avg('breakdown_ratio_unscheduled')
					.avg('breakdown_ratio_scheduled')
					.avg('work_hours')
					.avg('standby_hours')
					.avg('breakdown_hours_accident')
					.avg('breakdown_hours_scheduled')
					.avg('breakdown_hours_unscheduled')

				const data = ep_details[0]

				return {
					data: final_data,
					stoppages: {
						period: moment(req.start_month).startOf('month').format('DD MMM') + ' - ' + moment(req.start_month).endOf('month').format('DD MMM'),
						duration: stoppages_duration_all,
						totalEvent: stoppages_event_all,
					},
					summary: {
						avgActualPA: parseFloat(data['avg(`actual_pa`)']?.toFixed(2) || 0),
						avgBudgetPA: parseFloat(data['avg(`budget_pa`)']?.toFixed(2) || 0),
						avgActualEU: parseFloat(data['avg(`actual_eu`)']?.toFixed(2) || 0),
						avgActualMA: parseFloat(data['avg(`actual_ma`)']?.toFixed(2) || 0),
						avgActualUA: parseFloat(data['avg(`actual_ua`)']?.toFixed(2) || 0),
						avgWorkHours: parseFloat(data['avg(`work_hours`)']?.toFixed(2) || 0),
						avgStandbyHours: parseFloat(data['avg(`standby_hours`)']?.toFixed(2) || 0),
						avgBDRatioSCH: parseFloat(data['avg(`breakdown_ratio_scheduled`)']?.toFixed(2) || 0),
						avgBDRatioUNS: parseFloat(data['avg(`breakdown_ratio_unscheduled`)']?.toFixed(2) || 0),
						avgActualMTTR: parseFloat(data['avg(`actual_mttr`)']?.toFixed(2) || 0),
						avgActualMTBS: parseFloat(data['avg(`actual_mtbs`)']?.toFixed(2) || 0),
						avgBDHourACD: parseFloat(data['avg(`breakdown_hours_accident`)']?.toFixed(2) || 0),
						avgBDHourSCH: parseFloat(data['avg(`breakdown_hours_scheduled`)']?.toFixed(2) || 0),
						avgBDHourUNS: parseFloat(data['avg(`breakdown_hours_unscheduled`)']?.toFixed(2) || 0),
					},
				}
			} else {
				return {
					sucess: false,
					data: [],
				}
			}
		}
	}
}

module.exports = ReportHeavyEquipmentPerformanceController

async function userValidate(auth) {
	let user
	try {
		user = await auth.authenticator('jwt').getUser()
		return user
	} catch (error) {
		console.log(error)
		return null
	}
}

async function BUILD_PDF(pdfDocGen) {
	return new Promise((resolve, reject) => {
		pdfDocGen.getDataUrl((dataUrl) => {
			resolve(dataUrl)
		})
	})
}

async function BUILD_CHART(data) {
	let grafikPerformance = []
	let dataPerformance = []
	let grafikPieBreakdown = []
	let dataPieBreakdown = []
	let grafikDuration = []
	let grafikEvent = []
	let dataEvent = []

	const HePerformance = data.byKPI.dataTable
	dataPerformance = HePerformance
	for (const val of HePerformance) {
		grafikPerformance.push({
			value: parseFloat(val.actPA?.toFixed(2)),
			label: val.date,
			name: 'actual',
		})
		grafikPerformance.push({
			value: parseFloat(val.budgetPA?.toFixed(2)),
			label: val.date,
			name: 'plan',
		})
	}
	const RatioBreakdown = data.byDataRatio
	for (const val of RatioBreakdown) {
		grafikPieBreakdown.push({
			name: val.name,
			value: parseFloat(val.persen.toFixed(2)),
			label: val.name,
		})
		for (const obj of val.items) {
			dataPieBreakdown.push(obj)
		}
	}
	for (let i = 0; i < data.byDuration.series[0].data.length; i++) {
		grafikDuration.push({
			value: data.byDuration.series[0].data[i],
			label: data.byDuration.xAxis[i],
		})
	}
	for (let i = 0; i < data.byEvents.series[0].data.length; i++) {
		grafikEvent.push({
			value: data.byDuration.series[0].data[i],
			label: data.byDuration.xAxis[i],
		})
	}

	return {
		data: {
			grafikPerformance,
			dataPerformance,
			grafikPieBreakdown,
			dataPieBreakdown,
			grafikDuration,
			grafikEvent,
			dataEvent: data.dataEvent,
		},
	}
}
