'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FleetExcaHaulerSchema extends Schema {
  up () {
    this.create('fleet_exca_haulers', (table) => {
      table.increments()
      table.integer('fleet_id').unsigned().index('fleet_id')
      table.integer('exca_id').unsigned().index('exca_id')
      table.integer('hauler_id').unsigned().index('hauler_id')
      table.foreign('fleet_id').references('daily_fleets.id').onDelete('cascade').onUpdate('cascade')
      table.foreign('exca_id').references('daily_fleet_excas.id').onDelete('cascade').onUpdate('cascade')
      table.foreign('hauler_id').references('daily_fleet_haulers.id').onDelete('cascade').onUpdate('cascade')
    })
  }

  down () {
    this.drop('fleet_exca_haulers')
  }
}

module.exports = FleetExcaHaulerSchema
