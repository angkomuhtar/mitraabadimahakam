'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasFleetSchema extends Schema {
  up () {
    this.create('daily_fleets', (table) => {
      table.increments()
      table.integer('pit_id').unsigned().references('id').inTable('mas_pits').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('shift_id').unsigned().references('id').inTable('mas_shifts').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('activity_id').unsigned().references('id').inTable('mas_activities').onDelete('RESTRICT').onUpdate('CASCADE')
      table.date('date').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_fleets')
  }
}

module.exports = MasFleetSchema
