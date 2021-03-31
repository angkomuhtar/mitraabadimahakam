'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersGroupSchema extends Schema {
  up () {
    this.create('sys_users_groups', (table) => {
      table.increments()
      table.integer('user_id').unsigned().index('user_id')
      table.integer('group_id').unsigned().index('group_id')
      table.integer('mod_id').unsigned().index('mod_id')
      table.foreign('user_id').references('users.id').onDelete('cascade').onUpdate('cascade')
      table.foreign('group_id').references('users_groups.id').onDelete('cascade').onUpdate('cascade')
      table.foreign('mod_id').references('sys_modules.id').onDelete('cascade').onUpdate('cascade')
      table.string('user_tipe', 60).defaultTo(null)
    })
  }

  down () {
    this.drop('sys_users_groups')
  }
}

module.exports = UsersGroupSchema
