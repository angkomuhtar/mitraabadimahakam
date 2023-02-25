'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DowntimeActivity extends Model {
	static get table() {
		return 'downtime_activity'
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

	comp_group() {
		return this.belongsTo('App/Models/SysOption', 'comp_id', 'id')
	}

	downtime() {
		return this.hasOne('App/Models/DailyDowntimeEquipment', 'downtime_code', 'downtime_code')
	}
}

module.exports = DowntimeActivity
