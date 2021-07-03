'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyRitaseCoalDetailSchema extends Schema {
  up () {
    this.create('daily_ritase_coal_details', (table) => {
      table.increments()
      table.integer('ritasecoal_id').unsigned().references('id').inTable('daily_ritase_coals').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('seam_id').unsigned().references('id').inTable('mas_seams').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('dt_id').unsigned().references('id').inTable('mas_equipments').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('operator').unsigned().references('id').inTable('mas_employees').onDelete('CASCADE').onUpdate('CASCADE')
      table.datetime('checkout_pit').notNullable()
      table.datetime('checkin_jt').notNullable()
      table.datetime('checkout_jt').notNullable()
      table.string('ticket', 7).notNullable()
      table.string('kupon').defaultTo(null)
      table.float('w_gross', 8, 2).defaultTo(0.00)
      table.float('w_tare', 8, 2).defaultTo(0.00)
      table.float('w_netto', 8, 2).defaultTo(0.00)
      table.enu('coal_tipe', ['CC', 'DCN', 'DCO']).defaultTo('CC')
      table.integer('stockpile').defaultTo(0)
      table.integer('checker_jt').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('daily_ritase_coal_details')
  }
}

module.exports = DailyRitaseCoalDetailSchema
