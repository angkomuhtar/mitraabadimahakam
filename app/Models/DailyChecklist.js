'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyChecklist extends Model {
    static boot () {
        super.boot()
        this.addHook('beforeCreate', 'DailyChecklistHook.beforeADD')
        this.addHook('beforeUpdate', 'DailyChecklistHook.beforeUPDATE')
    }

    static get updatedAtColumn () {
        return null
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

    operator_unit(){
        return this.belongsTo("App/Models/MasEmployee", "operator", "id")
    }

    equipment(){
        return this.belongsTo("App/Models/MasEquipment", "unit_id", "id")
    }

    dailyFleet(){
        return this.belongsTo("App/Models/DailyFleet", "dailyfleet_id", "id")
    }

    dailyEvent(){
        return this.hasMany("App/Models/DailyEvent", "id", "timesheet_id")
    }

    dailyRefueling(){
        return this.hasOne("App/Models/DailyRefueling", "id", "timesheet_id")
    }

    p2h () {
        return this.belongsToMany("App/Models/MasP2H", "checklist_id", "p2h_id").pivotTable('daily_checkp2h')
    }

    shift() {
        return this.belongsTo("App/Models/MasShift", "shift_id", "id")
    }
}

module.exports = DailyChecklist
