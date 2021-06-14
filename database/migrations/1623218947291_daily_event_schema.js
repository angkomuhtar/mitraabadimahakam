'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyEventSchema extends Schema {
  up () {
    this.create('daily_events', (table) => {
      table.increments()
      table.integer('timesheet_id').unsigned().references('id').inTable('daily_checklists').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('event_id').unsigned().references('id').inTable('mas_events').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('equip_id').unsigned().references('id').inTable('mas_equipments').onDelete('CASCADE').onUpdate('CASCADE')
      table.text('description').defaultTo(null)
      table.float('time_duration', 8, 2).defaultTo(0.00)
      table.string('satuan').defaultTo('minutes')
      table.float('total_smu', 8, 2).defaultTo(0.00)
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_events')
  }
}

module.exports = DailyEventSchema
