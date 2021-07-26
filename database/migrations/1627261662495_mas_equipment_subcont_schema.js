'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasEquipmentSubcontSchema extends Schema {
  up () {
    this.create('mas_equipment_subconts', (table) => {
      table.increments()
      table.integer('subcont_id').unsigned().references('id').inTable('mas_sub_contractors').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('kode').notNullable()
      table.string('brand').notNullable()
      table.enu('tipe', ['HAULER', 'DIGGER', 'LV']).defaultTo('HAULER')
      table.enu('aktif', ['Y', 'N']).defaultTo('Y')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_equipment_subconts')
  }
}

module.exports = MasEquipmentSubcontSchema
