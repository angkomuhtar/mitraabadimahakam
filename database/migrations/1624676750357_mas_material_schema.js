'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasMaterialSchema extends Schema {
  up () {
    this.create('mas_materials', (table) => {
      table.increments()
      table.string('name').notNullable()
      table.string('kode').defaultTo(null)
      table.enu('tipe', ['BB', 'OB']).defaultTo('OB')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_materials')
  }
}

module.exports = MasMaterialSchema
