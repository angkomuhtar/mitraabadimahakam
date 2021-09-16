'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class VRitaseOb extends Model {
    static get table(){
        return 'v_ritase_ob'
    }

    checker () {
        return this.belongsTo("App/Models/User", "checker_id", "id")
    }

    spv () {
        return this.belongsTo("App/Models/User", "spv_id", "id")
    }
}

module.exports = VRitaseOb
