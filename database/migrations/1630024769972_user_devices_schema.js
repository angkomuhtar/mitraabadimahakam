'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserDevicesSchema extends Schema {
  up () {
    this.create('user_devices', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('device_model').defaultTo(null)
      table.string('ip').defaultTo(null)
      table.string('userId').defaultTo(null)
      table.string('playerId').defaultTo(null)
      table.timestamps()
    })
  }

  down () {
    this.drop('user_devices')
  }
}

module.exports = UserDevicesSchema
