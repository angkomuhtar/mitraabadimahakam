'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasDocumentation extends Model {
    details(){
        return this.hasMany("App/Models/MasDocumentationDetail", "id", "fitur_id")
    }
}

module.exports = MasDocumentation
