'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasP2HSchema extends Schema {
  up () {
    this.create('mas_p2h', (table) => {
      table.increments()
      table.text('task').notNullable()
      table.integer('urut').notNullable()
      table.enu('sts', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_p2h')
  }
}

module.exports = MasP2HSchema
