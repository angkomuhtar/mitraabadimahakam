'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyRitaseCoalDetail extends Model {
    static boot () {
        super.boot()
        this.addHook('afterSave', 'DailyRitaseCoalDetailHook.afterSave')
        this.addHook('afterDelete', 'DailyRitaseCoalDetailHook.afterDelete')
    }

    ritase_coal(){
        return this.belongsTo("App/Models/DailyRitaseCoal", "ritasecoal_id", "id")
    }

    seam(){
        return this.belongsTo("App/Models/MasSeam", "seam_id", "id")
    }

    transporter(){
        return this.belongsTo("App/Models/MasEquipment", "dt_id", "id")
    }

    transporter_subcon(){
        return this.belongsTo("App/Models/MasEquipmentSubcont", "subcondt_id", "id")
    }

    opr(){
        return this.belongsTo("App/Models/MasEmployee", "operator", "id")
    }

    opr_subcon(){
        return this.belongsTo("App/Models/MasEmployeeSubcont", "subcon_operator", "id")
    }

    checkerJT(){
        return this.belongsTo("App/Models/VUser", "checker_jt", "id")
    }
}

module.exports = DailyRitaseCoalDetail
