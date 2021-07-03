'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasSeamSchema extends Schema {
  up () {
    this.create('mas_seams', (table) => {
      table.increments()
      table.integer('pit_id').unsigned().references('id').inTable('mas_pits').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('kode').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_seams')
  }
}

module.exports = MasSeamSchema
