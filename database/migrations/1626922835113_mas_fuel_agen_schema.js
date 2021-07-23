'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasFuelAgenSchema extends Schema {
  up () {
    this.create('mas_fuel_agens', (table) => {
      table.increments()
      table.string('kode').notNullable()
      table.string('name').notNullable()
      table.string('alamat').defaultTo(null)
      table.string('telp').defaultTo(null)
      table.string('email').defaultTo(null)
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_fuel_agens')
  }
}

module.exports = MasFuelAgenSchema
