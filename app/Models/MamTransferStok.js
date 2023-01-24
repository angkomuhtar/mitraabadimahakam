'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamTransferStok extends Model {
    static get table(){
        return 'mam_transfer_stoks'
    }
}

module.exports = MamTransferStok
