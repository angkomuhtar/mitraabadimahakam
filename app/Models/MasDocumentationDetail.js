'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasDocumentationDetail extends Model {
    fitur(){
        return this.belongsTo("App/Models/MasDocumentation", "fitur_id", "id")
    }
}

module.exports = MasDocumentationDetail
