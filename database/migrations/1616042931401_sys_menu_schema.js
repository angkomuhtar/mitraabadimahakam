'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SysMenuSchema extends Schema {
  up () {
    this.create('sys_menus', (table) => {
      table.increments()
      table.string('name', 25).notNullable().unique()
      table.string('uri', 100).notNullable()
      table.string('icon', 30).defaultTo(null)
      table.integer('urut').notNullable()
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('sys_menus')
  }
}

module.exports = SysMenuSchema
