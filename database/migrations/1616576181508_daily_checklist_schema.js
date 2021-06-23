'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyChecklistSchema extends Schema {
  up () {
    this.create('daily_checklists', (table) => {
      table.increments()
      table.integer('user_chk').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('user_spv').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('user_lead').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('operator').unsigned().references('id').inTable('mas_employees').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('unit_id').unsigned().references('id').inTable('mas_equipments').onDelete('CASCADE').onUpdate('CASCADE')
      // table.integer('shift_id').unsigned().references('id').inTable('mas_shifts').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('dailyfleet_id').unsigned().references('id').inTable('daily_fleets').onDelete('CASCADE').onUpdate('CASCADE')
      table.date('tgl').notNullable()
      table.text('description').defaultTo(null)
      table.float('begin_smu', 8, 2).defaultTo(0)
      table.float('end_smu', 8, 2).defaultTo(0)
      table.float('used_smu', 8, 2).defaultTo(0)
      table.datetime('approved_at').notNullable()
      table.datetime('finish_at').defaultTo(null)
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_checklists')
  }
}

module.exports = DailyChecklistSchema
