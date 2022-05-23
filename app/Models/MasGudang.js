'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasGudang extends Model {
    static get table(){
        return 'mam_gudangs'
    }
}

module.exports = MasGudang
