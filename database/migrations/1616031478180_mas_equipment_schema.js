'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasEquipmentSchema extends Schema {
  up () {
    this.create('mas_equipments', (table) => {
      table.increments()
      table.string('no_serial', 25).notNullable()
      table.string('tipe').notNullable().comment('sys-options tipe_equipment')
      table.string('brand').notNullable().comment('sys-options brand_equipment')
      table.string('model').notNullable().comment('sys-options model_equipment')
      table.string('qty_capacity').defaultTo(null).comment('Jumlah kapasitas produksi')
      table.string('bbm_capacity').defaultTo(null).comment('Jumlah kapasitas bbm')
      table.string('satuan').notNullable().comment('sys-options stn_capacity_equipment')
      table.string('engine_model').defaultTo(null)
      table.string('engine_seri').defaultTo(null)
      table.date('received_date').notNullable().comment('tanggal pembelian')
      table.date('received_hm').defaultTo(null).comment('HM awal pembelian')
      table.text('remark').defaultTo(null).comment('keterangan detail')
      table.string('status').notNullable().comment('status equipment milik sendiri atau sewa')
      table.string('isMaintenance', ['Y', 'N']).defaultTo('N').comment('status equipment under maintenance atau active')
      table.integer('created_by').unsigned().references('id').inTable('users').onDelete('RESTRICT').onUpdate('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_equipments')
  }
}

module.exports = MasEquipmentSchema
