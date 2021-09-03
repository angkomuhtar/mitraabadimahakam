'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyRefueling extends Model {
    static get updatedAtColumn () {
        return null
    }

    user () {
        return this.belongsTo("App/Models/VUser", "fuelman", "id")
    }

    timesheet () {
        return this.belongsTo("App/Models/DailyChecklist", "timesheet_id", "id")
    }

    equipment () {
        return this.belongsTo("App/Models/MasEquipment", "equip_id", "id")
    }

    truck_fuel () {
        return this.belongsTo("App/Models/MasEquipment", "fuel_truck", "id")
    }

    operator_unit () {
        return this.belongsTo("App/Models/MasEmployee", "operator", "id")
    }
}

module.exports = DailyRefueling
