'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasFuelSchema extends Schema {
  up () {
    this.create('mas_fuels', (table) => {
      table.increments()
      table.string('name').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_fuels')
  }
}

module.exports = MasFuelSchema
