'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasEmployeeSubcontSchema extends Schema {
  up () {
    this.create('mas_employee_subconts', (table) => {
      table.increments()
      table.integer('subcont_id').unsigned().references('id').inTable('mas_sub_contractors').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('fullname').notNullable()
      table.string('position').notNullable()
      table.enu('aktif', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_employee_subconts')
  }
}

module.exports = MasEmployeeSubcontSchema
