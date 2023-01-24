'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MamWeatherSchema extends Schema {
  up () {
    this.create('mam_weathers', (table) => {
      table.increments()
      table.string('kota').notNullable()
      table.string('weather').notNullable()
      table.string('description').notNullable()
      table.string('icon').notNullable()
      table.string('temp').notNullable()
      table.string('long').notNullable()
      table.string('lat').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('mam_weathers')
  }
}

module.exports = MamWeatherSchema
