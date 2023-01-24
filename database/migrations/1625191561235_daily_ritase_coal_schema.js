'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyRitaseCoalSchema extends Schema {
  up () {
    this.create('daily_ritase_coals', (table) => {
      table.increments()
      table.integer('dailyfleet_id').unsigned().references('id').inTable('daily_fleets').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('checker_id').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('shift_id').unsigned().references('id').inTable('mas_shifts').onDelete('CASCADE').onUpdate('CASCADE')
      table.float('distance').notNullable()
      table.string('block').notNullable()
      table.datetime('date').notNullable()
      table.integer('coal_rit').defaultTo(0)
      table.float('tw_gross', 12, 2).defaultTo(0.00)
      table.float('tw_tare', 12, 2).defaultTo(0.00)
      table.float('tw_netto', 12, 2).defaultTo(0.00)
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_ritase_coals')
  }
}

module.exports = DailyRitaseCoalSchema
