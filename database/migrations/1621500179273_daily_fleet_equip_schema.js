'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyFleetEquipSchema extends Schema {
  up () {
    this.create('daily_fleet_equips', (table) => {
      table.increments()
      table.integer('dailyfleet_id').unsigned().references('id').inTable('daily_fleets').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('equip_id').unsigned().references('id').inTable('mas_equipments').onDelete('RESTRICT').onUpdate('CASCADE')
      table.datetime('datetime').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_fleet_equips')
  }
}

module.exports = DailyFleetEquipSchema
