'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MamDownloadSchema extends Schema {
  up () {
    this.create('mam_downloads', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL').onUpdate('CASCADE')
      table.string('url_download').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('mam_downloads')
  }
}

module.exports = MamDownloadSchema
