'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MonthlyPlanSchema extends Schema {
  up () {
    this.create('monthly_plans', (table) => {
      table.increments()
      table.integer('pit_id').unsigned().references('id').inTable('mas_pits').onDelete('CASCADE').onUpdate('CASCADE')
      table.enu('tipe', ['OB', 'BB']).defaultTo('OB')
      table.datetime('month').notNullable()
      table.float('estimate', 10, 2).defaultTo(0.00)
      table.float('actual', 10, 2).defaultTo(0.00)
      table.enu('satuan', ['BCM', 'MT']).defaultTo('BCM')
      table.timestamps()
    })
  }

  down () {
    this.drop('monthly_plans')
  }
}

module.exports = MonthlyPlanSchema
