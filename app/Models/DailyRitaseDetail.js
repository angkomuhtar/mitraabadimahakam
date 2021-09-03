'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyRitaseDetail extends Model {
    static boot () {
        super.boot()
        this.addHook('beforeCreate', 'DailyRitaseDetailHook.beforeInsertData')
        this.addHook('afterCreate', 'DailyRitaseDetailHook.afterInsertData')
        this.addHook('afterDelete', 'DailyRitaseDetailHook.afterDeleteData')
        this.addHook('beforeUpdate', 'DailyRitaseDetailHook.beforeUpdateData')
    }

    daily_ritase(){
        return this.belongsTo("App/Models/DailyRitase", "dailyritase_id", "id")
    }

    checker(){
        return this.belongsTo("App/Models/User", "checker_id", "id")
    }

    spv(){
        return this.belongsTo("App/Models/User", "spv_id", "id")
    }

    operator(){
        return this.belongsTo("App/Models/MasEmployee", "opr_id", "id")
    }

    hauler(){
        return this.belongsTo("App/Models/MasEquipment", "hauler_id", "id")
    }
}

module.exports = DailyRitaseDetail
