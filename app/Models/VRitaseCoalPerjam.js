'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class VRitaseCoalPerjam extends Model {
    static get table(){
        return 'v_ritase_coal_perjam'
    }
}

module.exports = VRitaseCoalPerjam
