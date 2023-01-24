'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasSupplierSchema extends Schema {
  up () {
    this.create('mas_suppliers', (table) => {
      table.increments()
      table.string('kode').notNullable()
      table.string('name').notNullable()
      table.string('tipe').defaultTo(null)
      table.string('email').defaultTo(null)
      table.string('phone').defaultTo(null)
      table.string('address').defaultTo(null)
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_suppliers')
  }
}

module.exports = MasSupplierSchema
