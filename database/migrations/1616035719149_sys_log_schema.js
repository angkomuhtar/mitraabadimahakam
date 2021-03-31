'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SysLogSchema extends Schema {
  up () {
    this.create('sys_logs', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.text('keterangan').defaultTo(null)
      table.string('src_data').defaultTo(null)
      table.enu('action', ['C', 'U', 'D']).defaultTo('C')
      table.timestamps()
    })
  }

  down () {
    this.drop('sys_logs')
  }
}

module.exports = SysLogSchema
