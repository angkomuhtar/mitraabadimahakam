'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyChecklist extends Model {
    static boot () {
        super.boot()
        this.addHook('beforeCreate', 'DailyChecklistHook.beforeADD')
        this.addHook('beforeUpdate', 'DailyChecklistHook.beforeUPDATE')
    }

    userCheck(){
        return this.belongsTo("App/Models/User", "user_chk", "id")
    }

    spv(){
        return this.belongsTo("App/Models/User", "user_spv", "id")
    }

    lead(){
        return this.belongsTo("App/Models/User", "user_lead", "id")
    }

    equipment(){
        return this.belongsTo("App/Models/MasEquipment", "unit_id", "id")
    }

    dailyFleet(){
        return this.belongsTo("App/Models/DailyFleet", "dailyfleet_id", "id")
    }

    p2h () {
        return this.belongsToMany("App/Models/MasP2H", "checklist_id", "p2h_id").pivotTable('daily_checkp2h')
    }
}

module.exports = DailyChecklist
