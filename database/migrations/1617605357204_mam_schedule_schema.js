'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MamScheduleSchema extends Schema {
  up () {
    this.create('mam_schedules', (table) => {
      table.increments()
      table.integer('employee_id').unsigned().references('id').inTable('mas_employees').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('divisi_id').unsigned().references('id').inTable('mas_divisis').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('shift_id').unsigned().references('id').inTable('mas_shifts').onDelete('CASCADE').onUpdate('CASCADE')
      table.date('tgl_schdl').notNullable()
      table.enu('status', ['OS', 'CT', 'DO', 'PM']).defaultTo('OS').comment('OS=OnShift, CT=Cuti, DO=DayOff, PM=Permit')
      table.timestamps()
    })
  }

  down () {
    this.drop('mam_schedules')
  }
}

module.exports = MamScheduleSchema
