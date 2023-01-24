'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MamNotificationSchema extends Schema {
  up () {
    this.create('mam_notifications', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('title').defaultTo(null)
      table.text('message').defaultTo(null)
      table.text('uri').defaultTo(null)
      table.timestamps()
    })
  }

  down () {
    this.drop('mam_notifications')
  }
}

module.exports = MamNotificationSchema
