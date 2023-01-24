'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MamGallerySchema extends Schema {
  up () {
    this.create('mam_galleries', (table) => {
      table.increments()
      table.integer('traveldoc_id').unsigned().references('id').inTable('mam_travel_documents').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('size', 10).notNullable()
      table.string('filetype', 5).notNullable()
      table.string('url', 200).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('mam_galleries')
  }
}

module.exports = MamGallerySchema
