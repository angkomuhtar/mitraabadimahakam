'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamTransferStokItem extends Model {
    static get table(){
        return 'mam_transfer_stok_items'
    }
}

module.exports = MamTransferStokItem
