'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DailyRitaseCoalDetailSchema extends Schema {
  up () {
    this.alter('daily_ritase_coal_details', (table) => {
      // alter table
      table.integer('subcondt_id').unsigned().references('id').inTable('mas_equipment_subconts').onDelete('CASCADE').onUpdate('CASCADE').after('dt_id')
      table.integer('subcon_operator').unsigned().references('id').inTable('mas_employee_subconts').onDelete('CASCADE').onUpdate('CASCADE').after('operator')
    })
  }

  down () {
    this.table('daily_ritase_coal_details', (table) => {
      // reverse alternations
      table.integer('subcondt_id').unsigned().references('id').inTable('mas_equipment_subconts').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('subcon_operator').unsigned().references('id').inTable('mas_employee_subconts').onDelete('CASCADE').onUpdate('CASCADE')
    })
  }
}

module.exports = DailyRitaseCoalDetailSchema
