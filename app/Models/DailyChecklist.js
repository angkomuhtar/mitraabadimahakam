'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyChecklist extends Model {
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
}

module.exports = DailyChecklist
