'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasActivitySchema extends Schema {
  up () {
    this.create('mas_activities', (table) => {
      table.increments()
      table.string('kode', 5).notNullable()
      table.string('name', 100).notNullable()
      table.enu('sts', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_activities')
  }
}

module.exports = MasActivitySchema
