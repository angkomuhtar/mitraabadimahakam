'use strict'

const version = '2.0'
const fs = require('fs')
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require('moment')
const MasPit = use('App/Models/MasPit')
const MasSite = use('App/Models/MasSite')
const QuickChart = require('quickchart-js')
const { performance } = require('perf_hooks')
const diagnoticTime = use('App/Controllers/Http/customClass/diagnoticTime')
const MasEquipment = use('App/Models/MasEquipment')
const ReportPDFHelpers = use('App/Controllers/Http/Helpers/ReportPDF')
const ReportHeavyEquipment = use('App/Controllers/Http/Helpers/ReportHeavyEquipment')
const EquipmentPerformance = use('App/Models/MamEquipmentPerformance')
const EquipmentPerformanceDetails = use('App/Models/MamEquipmentPerformanceDetails')
const DailyDowntimeEquipment = use('App/Models/DailyDowntimeEquipment')
var pdfMake = require('pdfmake/build/pdfmake.js')
var pdfFonts = require('pdfmake/build/vfs_fonts.js')
pdfMake.vfs = pdfFonts.pdfMake.vfs

class ReportHeavyEquipmentPerformanceController {


	async weekCheck (start,end) {
	    const start_of_week = moment(start).startOf('week').format('YYYY-MM-DD');
	    const start_of_week1 = moment(end).startOf('week').format('YYYY-MM-DD');
	    const end_of_week = moment(end).endOf('week').format('YYYY-MM-DD');
		const end_of_week1 = moment(start).endOf('week').format('YYYY-MM-DD');
		const week_arr = [];
	    // check if same week
	    if(start_of_week1 === start_of_week) {
			const start = moment(start_of_week).format('YYYY-MM-DD');
			const end =  moment(start_of_week).add(6, 'days').format('YYYY-MM-DD');
			const obj = {
				start : start,
				end : end,
				day : `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM')}`,
				data : {}
			};
			week_arr.push(obj);
	    } else {
	        const get_diff = (moment(end_of_week).diff(start_of_week, 'days') + 1) // week
	        const arrDate = Array.from({ length: get_diff }, (x, i) =>
	        moment(start_of_week).startOf('week').add(i, 'days').format('YYYY-MM-DD')
	   )
	        let start_of_week_array = [];
	        for(const value of arrDate) {
	            const week_start = moment(value).startOf('week').format('YYYY-MM-DD');
	            start_of_week_array.push(week_start)
	        };
	        start_of_week_array = _.uniq(start_of_week_array);
	        for(const date of start_of_week_array) {
	            const start = moment(date).format('YYYY-MM-DD');
	            const end =  moment(date).add(6, 'days').format('YYYY-MM-DD');
	            const obj = {
	                start : start,
	                end : end,
	                day : `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM')}`,
	                data : {}
	            };
	            week_arr.push(obj);
	        }
	    }
		return week_arr || [];
	};



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

		const parsedEquipment = equipments.map((v) => {
			return {
				id: String(v.id),
				title: v.tipe,
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
				title: v.unit_model,
			}
		})

		return {
			data: parsedEquipment,
		}
	}

	async GET_REPORT({ auth, request, response }) {
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
		if (req.inp_ranges === 'DAILY') {
			req.start_date = req.start
			req.end_date = req.end

			const dateStart = moment(req.start_date).format('YYYY-MM-DD')
			const dateEnd = moment(req.end_date).format('YYYY-MM-DD')
			const final_data = []
			const stoppages_duration_all = []
			const stoppages_event_all = []


            // methods
			const GET_DATA_STOPPAGES = (componentName) => {
                let dur = 0;

                let count = 0;
                for(const value of stoppages_event) {
                    if(value.name === componentName) {
                        count += 1
                        dur += value.duration
                    }
                }

                return {
                    total : count,
                    duration : dur
                };
            }


			const ep_details = (
				await EquipmentPerformanceDetails.query()
					.where((wh) => {
						wh.where('date', '>=', dateStart)
						wh.where('date', '<=', dateEnd)
						wh.where('site_id', req.site_id)
						wh.where('equip_id', req.equip_id)
					})
					.orderBy('date', 'asc')
					.fetch()
			).toJSON()

			const daily_downtime = (
				await DailyDowntimeEquipment.query()
					.where((wh) => {
						wh.where('breakdown_start', '>=', dateStart)
						wh.where('breakdown_start', '<=', dateEnd)
						wh.where('equip_id', req.equip_id)
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
				.map((v) => v.replace('\t', ' '))
				.map((v) => v.trim())
				.slice(1)
			let stoppages_event = []
			if (daily_downtime.length > 0) {
				for (const data of daily_downtime) {
					stoppages_event.push({
                        name : data.component_group,
                        duration : data.downtime_total
                    })
				}

				for (const component of arrComponent) {
					const componentName = component.split(' ')[0]
					const obj1 = {
						label: componentName,
						value: GET_DATA_STOPPAGES(componentName).duration,
                        frontColor : '#0096FF',
                        longName : component
					}
					const obj2 = {
						label: componentName,
						value: GET_DATA_STOPPAGES(componentName).total,
                        frontColor : '#0096FF',
                        longName : component
					}

                    stoppages_duration_all.push(obj1);
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
					let obj1 = {} // pa bpa
					let obj2 = {} // wh stdh
					let obj3 = {
						// bd total
						stacks: [],
					}
					let obj4 = {} // bd ratio
					let obj5 = {} // actual mean time
					let obj6 = {} // target mean time
					const date = moment(data.date).format('DD/MM')
					if (ctx % 2 === 0) {
						obj1 = { value: data.actual_pa, frontColor: '#0096FF', desc: 'PA Actual' }
						obj2 = { value: data.work_hours, frontColor: '#0096FF', desc: 'Work Hours' }
						obj4 = { value: data.breakdown_ratio_unscheduled, frontColor: '#0096FF', desc: 'BD Ratio SCH' }
						obj5 = { value: data.actual_mttr, frontColor: '#0096FF', desc: 'Actual MTTR' }
						obj6 = { value: data.actual_mtbs, frontColor: '#0096FF', desc: 'Actual MTBS' }
					} else {
						obj1 = {
							value: data.budget_pa,
							label: date,
							frontColor: '#fc0303',
							desc: 'PA Budget',
						}
						obj2 = {
							value: data.standby_hours,
							label: date,
							frontColor: '#fc0303',
							desc: 'Standby Hours',
						}
						obj4 = { value: data.breakdown_ratio_scheduled, frontColor: '#fc0303', label: date, desc: 'BD Ratio UNS' }
						obj5 = { value: data.target_mttr, label: date, frontColor: '#fc0303', desc: 'Target MTTR' }
						obj6 = { value: data.target_mtbs, label: date, frontColor: '#fc0303', desc: 'Target MTBS' }
					}
					obj3.stacks = [
						{ value: data.breakdown_hours_unscheduled, color: '#e3fc03', desc: 'BD UNS' },
						{ value: data.breakdown_hours_scheduled, color: '#0096FF', desc: 'BD SCH', marginBottom: 2 },
						{ value: data.breakdown_hours_accident, color: '#3103fc', desc: 'BD ACD', marginBottom: 2 },
					]

					obj3['label'] = date
					daily_ep_arr.push(obj1)
					daily_hm_arr.push(obj2)
					daily_breakdown_total.push(obj3)
					daily_breakdown_ratio.push(obj4)
					daily_actual_mean_time.push(obj5)
					daily_target_mean_time.push(obj6)
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
			}
			return {
				data: final_data,
                stoppages : {
                    duration : stoppages_duration_all,
                    totalEvent : stoppages_event_all
                }
			}
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
