'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasEvent extends Model {
    static boot () {
        super.boot()
        this.addHook('beforeCreate', 'MasEventHook.beforeADD')
        this.addHook('beforeUpdate', 'MasEventHook.beforeUPDATE')
    }
}

module.exports = MasEvent
