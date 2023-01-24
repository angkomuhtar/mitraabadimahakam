'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MamIssueSchema extends Schema {
  up () {
    this.create('mam_issues', (table) => {
      table.increments()
      table.integer('unit_id').unsigned().references('id').inTable('mas_equipments').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('report_by').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('event_id').unsigned().references('id').inTable('mas_events').onDelete('CASCADE').onUpdate('CASCADE')
      table.text('issue').defaultTo(null)
      table.timestamps()
    })
  }

  down () {
    this.drop('mam_issues')
  }
}

module.exports = MamIssueSchema
