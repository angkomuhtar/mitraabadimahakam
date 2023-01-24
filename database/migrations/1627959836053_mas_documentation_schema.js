'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasDocumentationSchema extends Schema {
  up () {
    this.create('mas_documentations', (table) => {
      table.increments()
      table.enu('platform', ['web', 'mobile']).defaultTo('web')
      table.string('fitur').notNullable()
      table.text('desc').defaultTo(null)
      table.enu('aktif', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_documentations')
  }
}

module.exports = MasDocumentationSchema
