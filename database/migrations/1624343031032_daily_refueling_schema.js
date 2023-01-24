'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyRefuelingSchema extends Schema {
  up () {
    this.create('daily_refuelings', (table) => {
      table.increments()
      table.integer('timesheet_id').unsigned().references('id').inTable('daily_checklists').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('equip_id').unsigned().references('id').inTable('mas_equipments').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('operator').unsigned().references('id').inTable('mas_employees').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('fuelman').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('fuel_truck').unsigned().references('id').inTable('mas_equipments').onDelete('CASCADE').onUpdate('CASCADE')
      table.datetime('fueling_at').notNullable()
      table.float('smu').notNullable()
      table.float('topup').notNullable()
      table.text('description').defaultTo(null)
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.enu('status', ['OPERATIONAL', 'MAINTENANCE']).defaultTo('OPERATIONAL')
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_refuelings')
  }
}

module.exports = DailyRefuelingSchema
