'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasUnitActivitiesEventsSchema extends Schema {
  up () {
    this.create('mas_unit_activities_events', (table) => {
      table.increments()
      table.integer('unit_activities_id').unsigned().references('id').inTable('mas_unit_activities').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('pit_id').unsigned().references('id').inTable('mas_pits').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('fleet_id').unsigned().references('id').inTable('mas_fleets').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('at_shift').unsigned().references('id').inTable('mas_shifts').onDelete('RESTRICT').onUpdate('CASCADE')
      table.string('hour', 50).notNullable()
      table.string('event_name', 150).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_unit_activities_events')
  }
}

module.exports = MasUnitActivitiesEventsSchema
