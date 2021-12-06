'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamTravelDocument extends Model {
    user_check () {
        return this.belongsTo("App/Models/User", "checkby", "id")
    }

    user_approve () {
        return this.belongsTo("App/Models/User", "approveby", "id")
    }

    pit () {
        return this.belongsTo("App/Models/MasSite", "site_id", "id")
    }

    gallery () {
        return this.hasMany("App/Models/MamGallery", "id", "traveldoc_id")
    }
}

module.exports = MamTravelDocument
