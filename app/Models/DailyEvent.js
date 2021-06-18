'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyEvent extends Model {
    static boot () {
        super.boot()
        this.addHook('beforeCreate', 'DailyEventHook.beforeADD')
        this.addHook('beforeUpdate', 'DailyEventHook.beforeUPDATE')
    }

    timesheet () {
        return this.belongsTo("App/Models/DailyChecklist", "timesheet_id", "id")
    }

    event () {
        return this.belongsTo("App/Models/MasEvent", "event_id", "id")
    }

    equipment () {
        return this.belongsTo("App/Models/MasEquipment", "equip_id", "id")
    }

    createdby () {
        return this.belongsTo("App/Models/User", "user_id", "id")
    }
}

module.exports = DailyEvent
