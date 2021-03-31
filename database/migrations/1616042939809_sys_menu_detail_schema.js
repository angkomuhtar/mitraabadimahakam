'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SysMenuDetailSchema extends Schema {
  up () {
    this.create('sys_menu_details', (table) => {
      table.increments()
      table.integer('menu_id').unsigned().references('id').inTable('sys_menus')
      table.string('subname', 25).notNullable().unique()
      table.string('uri', 100).notNullable()
      table.string('icon', 30).defaultTo(null)
      table.integer('urut').notNullable()
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('sys_menu_details')
  }
}

module.exports = SysMenuDetailSchema
