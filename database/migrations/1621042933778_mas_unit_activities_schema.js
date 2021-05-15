'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasUnitActivitiesSchema extends Schema {
  up () {
    this.create('mas_unit_activities', (table) => {
      table.increments()
      table.integer('fleet_id').unsigned().references('id').inTable('mas_fleets').onDelete('RESTRICT').onUpdate('CASCADE')
      table.string('job', 100).notNullable()
      table.integer('total_rotation_during_shift', 10)
      table.integer('at_shift').unsigned().references('id').inTable('mas_shifts').onDelete('RESTRICT').onUpdate('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_unit_activities')
  }
}

module.exports = MasUnitActivitiesSchema
