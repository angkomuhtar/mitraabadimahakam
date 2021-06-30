'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyPlanSchema extends Schema {
  up () {
    this.create('daily_plans', (table) => {
      table.increments()
      table.integer('monthlyplans_id').unsigned().references('id').inTable('monthly_plans').onDelete('CASCADE').onUpdate('CASCADE')
      table.date('current_date').notNullable()
      table.float('estimate', 10, 2).defaultTo(0.00)
      table.float('actual', 10, 2).defaultTo(0.00)
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_plans')
  }
}

module.exports = DailyPlanSchema
