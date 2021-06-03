'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyRitaseDetailSchema extends Schema {
  up () {
    this.create('daily_ritase_details', (table) => {
      table.increments()
      table.integer('dailyritase_id').unsigned().references('id').inTable('daily_ritases').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('checker_id').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('spv_id').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('hauler_id').unsigned().references('id').inTable('mas_equipments').onDelete('CASCADE').onUpdate('CASCADE')
      table.timestamp('check_in').notNullable()
      table.integer('urut').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_ritase_details')
  }
}

module.exports = DailyRitaseDetailSchema
