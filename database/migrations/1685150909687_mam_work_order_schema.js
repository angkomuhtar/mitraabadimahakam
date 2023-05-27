'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MamWorkOrderSchema extends Schema {
	up() {
		this.createIfNotExists('mam_work_orders', (table) => {
			table.increments()
			table.string('code', [25])
			table.string('breakdown_code')
			table.string('desc')
			table.string('correction')
			table.string('pic', [80])
			table.string('sts', [5])
			table.timestamps()
		})
	}

	down() {
		this.drop('mam_work_orders')
	}
}

module.exports = MamWorkOrderSchema
