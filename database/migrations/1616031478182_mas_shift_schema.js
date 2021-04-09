'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasShiftSchema extends Schema {
  up () {
    this.create('mas_shifts', (table) => {
      table.increments()
      table.string('name', 200).notNullable()
      table.string('kode').notNullable()
      table.float('duration', 4, 1).notNullable()
      table.time('start_shift').notNullable()
      table.time('end_shift').notNullable()
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_shifts')
  }
}

module.exports = MasShiftSchema
