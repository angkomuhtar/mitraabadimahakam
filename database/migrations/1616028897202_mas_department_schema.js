'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasDepartmentSchema extends Schema {
  up () {
    this.create('mas_departments', (table) => {
      table.increments()
      table.string('kode', 5).notNullable()
      table.string('nama', 50).notNullable()
      table.text('description', 200).defaultTo(null)
      table.enu('status', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_departments')
  }
}

module.exports = MasDepartmentSchema
