'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SysOptionsSchema extends Schema {
  up () {
    this.create('sys_options', (table) => {
      table.increments()
      table.string('group', 30).notNullable()
      table.string('teks', 50).notNullable()
      table.string('nilai', 50).notNullable()
      table.integer('urut').notNullable()
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('sys_options')
  }
}

module.exports = SysOptionsSchema
