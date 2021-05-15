'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasFleetSchema extends Schema {
  up () {
    this.create('mas_fleets', (table) => {
      table.increments()
      table.string('fleet_name', 100).notNullable()
      table.integer('pit_id').unsigned().references('id').inTable('mas_pits').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('created_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_fleets')
  }
}

module.exports = MasFleetSchema
