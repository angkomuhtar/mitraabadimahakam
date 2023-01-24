'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class VRitaseCoal extends Model {
    static get table(){
        return 'v_ritase_coal'
    }
}

module.exports = VRitaseCoal
