'use strict'

const TimeSheet = use('App/Controllers/Http/Helpers/TimeSheet')
const P2Hhelpers = use('App/Controllers/Http/Helpers/P2H')
const moment = require('moment')
const MasEquipment = use('App/Models/MasEquipment')
const MasEmployee = use('App/Models/MasEmployee')
const DailyChecklist = use('App/Models/DailyChecklist')

class DailyOperatorTimesheetController {
	async create({ auth, view }) {
		return view.render('operation.daily-timesheet.create-v2')
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

	async addItems({ view, auth, request, response }) {
		try {
			await auth.getUser()

			const req = request.all()

			const site_id = parseInt(req.site_id)

			if (!site_id) {
				throw new Error(`Please select site before adding new unit!`)
			}

			const equipments = (
				await MasEquipment.query()
					.where((wh) => {
						wh.where('site_id', site_id)
						wh.where('aktif', 'Y')
					})
					.orderBy('tipe', 'asc')
					.fetch()
			).toJSON()

			const operators = (
				await MasEmployee.query()
					.where((wh) => {
						wh.where('is_operator', 'Y')
						wh.where('aktif', 'Y')
						wh.where('site_id', site_id)
					})
					.fetch()
			).toJSON()

			if (!operators) {
				throw new Error('There has no employee on this site..')
			}
			if (!equipments) {
				throw new Error('There has no equipment on this site..')
			}

			const getDefaultHM = await DailyChecklist.query()
				.where((wh) => {
					wh.where('unit_id', equipments[0].id)
					wh.where('site_id', site_id)
				})
				.last()

			return {
				success: true,
				data: `<tr class="item-unit">
				<td>
				<select class="form-control select2x inp-timesheet" name="equipment_id" id="equipment_id" data-check="" required>
						${equipments.map((v) => {
							return `
								 <option value="${v.id}">${v.kode}</option>
							 `
						})}</select>
				</td>
				<td>
					<input type="text" class="form-control inp-timesheet" name="begin_smu" id="begin_smu" placeholder="HM" value="${getDefaultHM.end_smu || getDefaultHM.begin_smu || 0}">
				</td>
				<td>
					<input type="text" class="form-control inp-timesheet" name="end_smu" id="end_smu" placeholder="HM" value="">
				</td>
				<td>
					<input type="text" disabled class="form-control inp-timesheet" placeholder="HM" name="used_smu" id="used_smu" value="">
				</td>
				<td> 
				<select class="form-control select2x select2shift inp-timesheet" name="shift_id" id="shift_id" data-check="" required>
				${operators.map((v) => {
					return `
						 <option value="${v.id}">${v.fullname}</option>
					 `
				})}
				</select>
				</td>
				<td class="text-center"> 
				   <button class="btn btn-danger">Delete</button>
				</td>
			</tr>`,
			}
		} catch (error) {
			console.log('erorr message ,, ', error.message)
			return {
				success: false,
				message: error.message,
			}
		}
	}

	async getLastHMEquipment({ request, response, auth }) {
		const req = request.all()

		try {
			await auth.getUser()
		} catch (err) {
			return {
				success: false,
				message: 'You not authorized...',
			}
		}

		try {
			const unit_id = req.unit_id
			let getLastHM = await DailyChecklist.query()
				.where((wh) => {
					wh.where('unit_id', unit_id)
					wh.where('site_id', req.site_id)
				})
				.last()
			console.log('last hm >> ', getLastHM.toJSON())
			if (getLastHM) {
				return {
					success: true,
					data: {
						prevHM: getLastHM?.toJSON().end_smu || getLastHM?.toJSON().begin_smu || 0,
					},
				}
			}
		} catch (err) {
			return {
				success: false,
				data: {
					prevHM: 0,
				},
				message: err.message,
			}
		}
	}
}

module.exports = DailyOperatorTimesheetController
