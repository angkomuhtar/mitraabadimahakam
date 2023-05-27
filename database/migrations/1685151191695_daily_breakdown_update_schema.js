'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyBreakdownUpdateSchema extends Schema {
	up() {
		this.table('daily_downtime_equipment', (table) => {
			// alter table
			table.integer('bd_type', [11]).after('status')
			table.float('hour_meter').after('person_in_charge')
		})
	}

	down() {
		this.table('daily_downtime_equipment', (table) => {
			// reverse alternations
		})
	}
}

module.exports = DailyBreakdownUpdateSchema
