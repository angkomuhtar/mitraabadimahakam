'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SysUsersGroupSchema extends Schema {
  up () {
    this.create('users_groups', (table) => {
      table.increments()
      table.string('group_name', 30).notNullable()
      table.text('description').defaultTo(null)
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('users_groups')
  }
}

module.exports = SysUsersGroupSchema
