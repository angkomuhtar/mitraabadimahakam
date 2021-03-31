'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsrMenuDetailSchema extends Schema {
  up () {
    this.create('usr_menu_details', (table) => {
      table.increments()
      table.integer('submenu_id').unsigned().index('submenu_id')
      table.integer('user_id').unsigned().index('user_id')
      table.foreign('submenu_id').references('sys_menu_details.id').onDelete('cascade').onUpdate('cascade')
      table.foreign('user_id').references('users.id').onDelete('cascade').onUpdate('cascade')
    })
  }

  down () {
    this.drop('usr_menu_details')
  }
}

module.exports = UsrMenuDetailSchema
