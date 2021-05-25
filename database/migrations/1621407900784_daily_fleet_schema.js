'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasFleetSchema extends Schema {
  up () {
    this.create('daily_fleets', (table) => {
      table.increments()
      table.integer('pit_id').unsigned().references('id').inTable('mas_pits').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('fleet_id').unsigned().references('id').inTable('mas_fleets').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('activity_id').unsigned().references('id').inTable('mas_activities').onDelete('RESTRICT').onUpdate('CASCADE')
      // table.integer('equip_id').unsigned().references('id').inTable('mas_equipments').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('shift_id').unsigned().references('id').inTable('mas_shifts').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('RESTRICT').onUpdate('CASCADE')
      table.date('date').notNullable()
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_fleets')
  }
}

module.exports = MasFleetSchema
