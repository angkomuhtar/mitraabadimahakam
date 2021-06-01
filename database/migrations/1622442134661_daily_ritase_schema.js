'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyRitaseSchema extends Schema {
  up () {
    this.create('daily_ritases', (table) => {
      table.increments()
      table.integer('fleet_id').unsigned().references('id').inTable('mas_fleets').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('checker_id').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('spv_id').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('material').notNullable()
      table.integer('distance').notNullable()
      table.integer('exac_id').unsigned().references('id').inTable('mas_equipments').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('hauler_id').unsigned().references('id').inTable('mas_equipments').onDelete('CASCADE').onUpdate('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_ritases')
  }
}

module.exports = DailyRitaseSchema
