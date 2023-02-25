'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyDowntimeEquipment extends Model {
	static get table() {
		return 'daily_downtime_equipment'
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

	equipment() {
		return this.belongsTo('App/Models/MasEquipment', 'equip_id', 'id')
	}

	comp_group() {
		return this.belongsTo('App/Models/SysOption', 'component_group', 'id')
	}

	type_break() {
		return this.belongsTo('App/Models/SysOption', 'bd_type', 'id')
	}

	activity() {
		return this.belongsTo('App/Models/DowntimeActivity', 'breakdown_code', 'breakdown_code')
	}
}

module.exports = DailyDowntimeEquipment
