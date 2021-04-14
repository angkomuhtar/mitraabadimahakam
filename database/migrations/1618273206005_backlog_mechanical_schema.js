'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BacklogMechanicalSchema extends Schema {
  up () {
    this.create('backlog_mechanicals', (table) => {
      table.increments()
      table.sting('name').notNullable()
      table.integer('unit_id').unsigned().references('id').inTable('mas_equipments').onDelete('RESTRICT').onUpdate('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('backlog_mechanicals')
  }
}

module.exports = BacklogMechanicalSchema
