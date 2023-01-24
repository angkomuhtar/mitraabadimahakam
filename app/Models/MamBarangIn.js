'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamBarangIn extends Model {
    static get table(){
        return 'mam_barang_in'
    }

    author () {
        return this.belongsTo("App/Models/VUser", "created_by", "id")
    }

    barang () {
        return this.belongsTo("App/Models/MasBarang", "barang_id", "id")
    }

    gudang () {
        return this.belongsTo("App/Models/MasGudang", "gudang_id", "id")
    }

    materialRequest () {
        return this.belongsTo("App/Models/LogMaterialRequest", "request_id", "id")
    }

    purchasingRequest () {
        return this.belongsTo("App/Models/MamPurchasingRequest", "pr_id", "id")
    }
}

module.exports = MamBarangIn
