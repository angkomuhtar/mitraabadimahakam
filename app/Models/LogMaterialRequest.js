'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class LogMaterialRequest extends Model {
    static get table(){
        return 'mam_material_request'
    }

    site () {
        return this.belongsTo("App/Models/MasSite", "site_id", "id")
    }

    pit () {
        return this.belongsTo("App/Models/MasPit", "pit_id", "id")
    }

    department () {
        return this.belongsTo("App/Models/MasDepartment", "department_id", "id")
    }

    author () {
        return this.belongsTo("App/Models/VUser", "request_by", "id")
    }
    
    approved () {
        return this.belongsTo("App/Models/VUser", "approved_by", "id")
    }

    items () {
        return this.hasMany("App/Models/LogMaterialRequestItem", "id", "material_req_id")
    }

}

module.exports = LogMaterialRequest
