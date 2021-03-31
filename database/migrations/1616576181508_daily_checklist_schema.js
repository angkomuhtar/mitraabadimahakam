'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyChecklistSchema extends Schema {
  up () {
    this.create('daily_checklists', (table) => {
      table.increments()
      table.integer('user_chk').unsigned().references('id').inTable('users').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('user_spv').unsigned().references('id').inTable('users').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('user_lead').unsigned().references('id').inTable('users').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('unit_id').unsigned().references('id').inTable('mas_equipments').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('shift_id').unsigned().references('id').inTable('mas_shifts').onDelete('RESTRICT').onUpdate('CASCADE')
      table.date('tgl').notNullable()
      table.text('description').defaultTo(null)
      table.datetime('approved_at').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_checklists')
  }
}

module.exports = DailyChecklistSchema
