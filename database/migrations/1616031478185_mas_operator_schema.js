'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasOperatorSchema extends Schema {
  up () {
    this.create('mas_operators', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('RESTRICT').onUpdate('CASCADE')
      table.string('name', 50).notNullable()
      table.enu('identity_tipe', ['KTP', 'SIM', 'PASSPORT']).defaultTo('SIM')
      table.string('identity_no', 25).defaultTo(null)
      table.string('pas_photo', 200).defaultTo(null)
      table.enu('sts', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_operators')
  }
}

module.exports = MasOperatorSchema
