'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MamTravelDocumentSchema extends Schema {
  up () {
    this.create('mam_travel_documents', (table) => {
      table.increments()
      table.integer('checkby').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('site_id').unsigned().references('id').inTable('mas_sites').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('kode', 20).notNullable()
      table.enu('tipe', ['in', 'out']).defaultTo('in')
      table.string('delman', 200).defaultTo(null)
      table.text('narasi', 400).defaultTo(null)
      table.datetime('recived_at').defaultTo(null)
      table.integer('approveby').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.datetime('approve_at').defaultTo(null)
      table.enu('aktif', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mam_travel_documents')
  }
}

module.exports = MamTravelDocumentSchema
