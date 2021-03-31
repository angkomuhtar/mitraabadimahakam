'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProfileSchema extends Schema {
  up () {
    this.create('profiles', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('RESTRICT').onUpdate('CASCADE')
      table.string('nm_depan', 30).notNullable()
      table.string('nm_belakang', 30).defaultTo(null)
      table.string('phone', 30).notNullable()
      table.enu('jenkel', ['m', 'f']).defaultTo('m')
      table.text('avatar').defaultTo('/avatar/avatar-default.png')
      table.timestamps()
    })
  }

  down () {
    this.drop('profiles')
  }
}

module.exports = ProfileSchema
