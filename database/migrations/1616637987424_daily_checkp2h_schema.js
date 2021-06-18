'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyCheckp2HSchema extends Schema {
  up () {
    this.create('daily_checkp2h', (table) => {
      table.increments()
      table.integer('checklist_id').unsigned().references('id').inTable('daily_checklists').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('p2h_id').unsigned().references('id').inTable('mas_p2h').onDelete('RESTRICT').onUpdate('CASCADE')
      table.enu('is_check', ['Y', 'N']).defaultTo('N')
      table.text('description').defaultTo(null)
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_checkp2h')
  }
}

module.exports = DailyCheckp2HSchema
