'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamBarangStok extends Model {
    static get table(){
        return 'mam_barang_stoks'
    }
}

module.exports = MamBarangStok
