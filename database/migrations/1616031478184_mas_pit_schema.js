'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasPitSchema extends Schema {
  up () {
    this.create('mas_pits', (table) => {
      table.increments()
      table.integer('site_id').unsigned().references('id').inTable('mas_sites').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('kode', 5).notNullable()
      table.string('name', 100).notNullable()
      table.string('location', 100).defaultTo(null)
      table.float('ob_plan', 8, 2).defaultTo(null)
      table.float('coal_plan', 8, 2).defaultTo(null)
      table.enu('sts', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_pits')
  }
}

module.exports = MasPitSchema
