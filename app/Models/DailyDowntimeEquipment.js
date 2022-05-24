'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyDowntimeEquipment extends Model {
    static get table() {
        return 'daily_downtime_equipment'
    }

    equipment(){
        return this.belongsTo("App/Models/MasEquipment", "equip_id", "id")
    }
}

module.exports = DailyDowntimeEquipment
