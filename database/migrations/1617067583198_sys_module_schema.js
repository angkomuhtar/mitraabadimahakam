'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SysModuleSchema extends Schema {
  up () {
    this.create('sys_modules', (table) => {
      table.increments()
      table.string('name', 50).notNullable()
      table.string('description').defaultTo(null)
      table.enu('method', ['C', 'R', 'U', 'D']).defaultTo('R')
      table.timestamps()
    })
  }

  down () {
    this.drop('sys_modules')
  }
}

module.exports = SysModuleSchema
