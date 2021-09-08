'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyCoalExposedSchema extends Schema {
  up () {
    this.create('daily_coal_exposeds', (table) => {
      table.increments()
      table.integer('pit_id').unsigned().references('id').inTable('mas_pits').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('created_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.date('tgl').notNullable()
      table.float('volume', 20, 2).defaultTo(0)
      table.enu('aktif', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_coal_exposeds')
  }
}

module.exports = DailyCoalExposedSchema
