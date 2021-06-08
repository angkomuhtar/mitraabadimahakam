'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasP2H extends Model {
    static get table(){
        return 'mas_p2h'
    }

    static boot () {
        super.boot()
        this.addHook('beforeCreate', 'MasP2HHook.beforeADD')
        this.addHook('beforeUpdate', 'OptionHook.beforeUPDATE')
    }
}

module.exports = MasP2H
