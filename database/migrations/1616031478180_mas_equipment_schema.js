'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MasEquipmentSchema extends Schema {
  up () {
    this.create('mas_equipments', (table) => {
      table.increments()
      table.string('kode', 25).notNullable()
      table.string('unit_sn', 25).notNullable()
      table.string('tipe').notNullable().comment('sys-options jenis-unit')
      table.string('brand').notNullable().comment('sys-options brand-unit')
      table.string('unit_model').notNullable()
      table.string('qty_capacity').defaultTo(null).comment('Jumlah kapasitas produksi')
      table.string('fuel_capacity').defaultTo(null).comment('Jumlah kapasitas bbm')
      table.string('satuan').notNullable().comment('sys-options stn_capacity_equipment')
      table.string('engine_model').defaultTo(null)
      table.string('engine_sn').defaultTo(null)
      table.date('received_date').notNullable().comment('tanggal pembelian')
      table.float('received_hm', 8, 2).defaultTo(0.00).comment('HM awal pembelian')
      table.text('remark').defaultTo(null).comment('keterangan detail')
      table.enu('is_owned', ['Y', 'N']).defaultTo('Y').comment('status equipment milik sendiri atau sewa')
      table.string('isMaintenance', ['Y', 'N']).defaultTo('N').comment('status equipment under maintenance atau active')
      table.enu('is_warranty', ['Y', 'N']).defaultTo('N').comment('status equipment warranty')
      table.date('warranty_date').defaultTo(null)
      table.integer('dealer_id').unsigned().references('id').inTable('mas_dealers').onDelete('RESTRICT').onUpdate('CASCADE')
      table.integer('created_by').unsigned().references('id').inTable('users').onDelete('RESTRICT').onUpdate('CASCADE')
      table.enu('aktif', ['Y', 'N']).defaultTo('Y').comment('status data')
      table.timestamps()
    })
  }

  down () {
    this.drop('mas_equipments')
  }
}

module.exports = MasEquipmentSchema
