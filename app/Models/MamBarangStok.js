'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamBarangStok extends Model {
    static get table(){
        return 'mam_barang_stoks'
    }

    barang () {
        return this.belongsTo("App/Models/MasBarang", "barang_id", "id")
    }

    gudang () {
        return this.belongsTo("App/Models/MasGudang", "gudang_id", "id")
    }
}

module.exports = MamBarangStok
