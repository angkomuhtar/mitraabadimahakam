'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasDealersSchema extends Schema {
  up () {
    this.create('mas_dealers', (table) => {
      table.increments()
      table.string('dealer_name').notNullable()
      table.string('cp_name').defaultTo(null)
      table.string('cp_email').defaultTo(null)
      table.string('cp_phone').defaultTo(null)
      table.string('dealer_desc').defaultTo(null)
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_dealers')
  }
}

module.exports = MasDealersSchema
