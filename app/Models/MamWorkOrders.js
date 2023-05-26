'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamWorkOrders extends Model {
	static get table() {
		return 'mam_work_orders'
	}

	static boot() {
		super.boot()
	}

	static get createdAtColumn() {
		return 'created_at'
	}
	static get updatedAtColumn() {
		return 'updated_at'
	}

	breakdown() {
		return this.belongsTo('App/Models/DailyDowntimeEquipment', 'breakdown_code', 'downtime_code')
	}
}

module.exports = MamWorkOrders
