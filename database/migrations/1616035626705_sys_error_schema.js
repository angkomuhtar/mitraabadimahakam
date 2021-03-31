'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SysErrorSchema extends Schema {
  up () {
    this.create('sys_errors', (table) => {
      table.increments()
      table.string('name', 50).notNullable()
      table.string('message').defaultTo(null)
      table.text('description')
      table.integer('error_by').unsigned().references('id').inTable('users').onDelete('RESTRICT').onUpdate('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('sys_errors')
  }
}

module.exports = SysErrorSchema
