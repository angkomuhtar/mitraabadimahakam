'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsrMenuSchema extends Schema {
  up () {
    this.create('usr_menus', (table) => {
      table.increments()
      table.integer('menu_id').unsigned().index('menu_id')
      table.integer('user_id').unsigned().index('user_id')
      table.foreign('menu_id').references('sys_menus.id').onDelete('cascade').onUpdate('cascade')
      table.foreign('user_id').references('users.id').onDelete('cascade').onUpdate('cascade')
    })
  }

  down () {
    this.drop('usr_menus')
  }
}

module.exports = UsrMenuSchema
