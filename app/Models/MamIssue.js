'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamIssue extends Model {

    user () {
        return this.belongsTo("App/Models/VUser", "report_by", "id")
    }

    unit () {
        return this.belongsTo("App/Models/MasEquipment", "unit_id", "id")
    }

    // unit () {
    //     return this.hasMany("App/Models/MasEquipment", "id", "unit_id")
    // }


    dailyevent () {
        return this.belongsTo("App/Models/DailyEvent", "dailyevent_id", "id")
    }
}

module.exports = MamIssue
