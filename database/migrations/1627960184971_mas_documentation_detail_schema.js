'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasDocumentationDetailSchema extends Schema {
  up () {
    this.create('mas_documentation_details', (table) => {
      table.increments()
      table.integer('fitur_id').unsigned().references('id').inTable('mas_documentations').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('title').notNullable()
      table.text('teks').defaultTo(null)
      table.string('img_doc').defaultTo(null)
      table.enu('aktif', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_documentation_details')
  }
}

module.exports = MasDocumentationDetailSchema
