'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasBarang extends Model {
    static get table(){
        return 'mas_barangs'
    }
}

module.exports = MasBarang
