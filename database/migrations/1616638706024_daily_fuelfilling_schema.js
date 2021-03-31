'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyFuelfillingSchema extends Schema {
  up () {
    this.create('daily_fuelfillings', (table) => {
      table.increments()
      table.integer('shift_id').unsigned().references('id').inTable('mas_shifts').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('unit_id').unsigned().references('id').inTable('mas_equipments').onDelete('RESTRICT').onUpdate('CASCADE')
      table.float('smu', 8, 2).notNullable()
      table.float('qty', 8, 2).notNullable()
      table.datetime('date_fill').notNullable()
      table.string('opr_filler').notNullable()
      table.integer('opr_unit').unsigned().references('id').inTable('users').onDelete('RESTRICT').onUpdate('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_fuelfillings')
  }
}

module.exports = DailyFuelfillingSchema
