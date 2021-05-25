'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasFleetSchema extends Schema {
  up () {
    this.create('mas_fleets', (table) => {
      table.increments()
      table.string('kode', 10).notNullable()
      table.string('name').notNullable()
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_fleets')
  }
}

module.exports = MasFleetSchema
