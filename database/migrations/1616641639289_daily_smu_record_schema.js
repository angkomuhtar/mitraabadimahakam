'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailySmuRecordSchema extends Schema {
  up () {
    this.create('daily_smu_records', (table) => {
      table.increments()
      table.datetime('start_date').notNullable()
      table.float('start_smu', 8, 2).notNullable()
      table.datetime('end_date').defaultTo(null)
      table.float('end_smu').defaultTo(null)
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_smu_records')
  }
}

module.exports = DailySmuRecordSchema
