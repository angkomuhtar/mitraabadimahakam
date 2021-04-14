'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasSiteSchema extends Schema {
  up () {
    this.create('mas_sites', (table) => {
      table.increments()
      table.string('name').notNullable()
      table.text('Keterangan').defaultTo(null)
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_sites')
  }
}

module.exports = MasSiteSchema
