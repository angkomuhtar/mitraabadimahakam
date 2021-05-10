'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UnitStopOperationReasonsSchema extends Schema {
  up () {
    this.create('unit_stop_operation_reason', (table) => {
      table.increments()
      table.string('name').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('unit_stop_operation_reason')
  }
}

module.exports = UnitStopOperationReasonsSchema
