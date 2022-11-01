'use strict'

const TimeSheet = use('App/Controllers/Http/Helpers/TimeSheet')
const P2Hhelpers = use('App/Controllers/Http/Helpers/P2H')
const moment = require('moment')
const MasEquipment = use('App/Models/MasEquipment')

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

			console.log('site id >> ', site_id)
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
			).toJSON();

			if (!equipments) {
				console.log('this runs ? ')
				throw new Error('There has no equipment on this site..')
			}

			return {
				success : true,
				data : `<tr>
				<td>
					<div class="form-group">
						<select class="form-control select2x select2shift inp-timesheet" name="shift_id" id="shift_id" data-check="" required>
						${equipments.map((v) => {
						  return `
								 <option value="${v.id}">${v.kode}</option>
							 `
					  })}</select>
					</div>
				</td>
				<td>
					<input type="text" class="form-control inp-timesheet" name="begin_smu" id="begin_smu" placeholder="HM" value="">
				</td>
				<td>
					<input type="text" class="form-control inp-timesheet" name="end_smu" id="end_smu" placeholder="HM" value="">
				</td>
				<td>
					<input type="text" disabled class="form-control inp-timesheet" placeholder="HM" name="used_smu" id="used_smu" value="">
				</td>
				<td> 
					<div class="form-group">
						<select class="form-control select2x select2shift inp-timesheet" name="shift_id" id="shift_id" data-check="" required></select>
					</div>
				</td>
				<td class="text-center"> 
				   <button class="btn btn-danger">Delete</button>
				</td>
			</tr>`
			}
		} catch (error) {
			console.log('erorr message ,, ', error.message)
			return {
				success: false,
				message: error.message,
			}
		}
	}
}

module.exports = DailyOperatorTimesheetController
