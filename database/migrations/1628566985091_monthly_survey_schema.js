'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MonthlySurveySchema extends Schema {
  up () {
    this.create('monthly_surveys', (table) => {
      table.increments()
      table.integer('site_id').unsigned().references('id').inTable('mas_sites').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('pit_id').unsigned().references('id').inTable('mas_pits').onDelete('CASCADE').onUpdate('CASCADE')
      table.date('start_survey').notNullable()
      table.date('end_survey').notNullable()
      table.float('vol_survey', 10, 2).defaultTo(0.00)
      table.timestamps()
    })
  }

  down () {
    this.drop('monthly_surveys')
  }
}

module.exports = MonthlySurveySchema
