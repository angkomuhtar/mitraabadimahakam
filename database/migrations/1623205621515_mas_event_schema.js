'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasEventSchema extends Schema {
  up () {
    this.create('mas_events', (table) => {
      table.increments()
      table.string('kode', 10).notNullable()
      table.string('narasi', 200).notNullable()
      table.enu('satuan', ['HM', 'TIME']).defaultTo('HM')
      table.enu('engine', ['off', 'on']).defaultTo('off')
      table.enu('status', ['idle', 'inactive', 'productive']).defaultTo('idle')
      table.enu('aktif', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_events')
  }
}

module.exports = MasEventSchema
