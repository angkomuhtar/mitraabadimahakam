'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasDivisiSchema extends Schema {
  up () {
    this.create('mas_divisis', (table) => {
      table.increments()
      table.integer('dept_id').unsigned().references('id').inTable('mas_departments').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('nama', 50).notNullable()
      table.text('description', 200).defaultTo(null)
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_divisis')
  }
}

module.exports = MasDivisiSchema
