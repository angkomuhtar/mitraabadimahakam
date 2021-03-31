'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyFleetHaulerSchema extends Schema {
  up () {
    this.create('daily_fleet_haulers', (table) => {
      table.increments()
      table.integer('hauler_id').unsigned().references('id').inTable('mas_equipments').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('opr_id').unsigned().references('id').inTable('mas_operators').onDelete('RESTRICT').onUpdate('CASCADE')
      table.date('date').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_fleet_haulers')
  }
}

module.exports = DailyFleetHaulerSchema
