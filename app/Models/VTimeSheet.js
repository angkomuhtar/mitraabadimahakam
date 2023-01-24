'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class VTimeSheet extends Model {
    static get table(){
        return 'v_timesheet'
    }

    operator () {
        return this.belongsTo('App/Models/MasEmployee', "operator_id", "id")
    }

    spv_user () {
        return this.belongsTo('App/Models/VUser', "spv", "id")
    }

    checker_user () {
        return this.belongsTo('App/Models/VUser', "checker", "id")
    }

    event () {
        return this.belongsTo("App/Models/MasEvent", "event_id", "id")
    }

    dailyevent () {
        return this.hasMany("App/Models/DailyEvent", "no_timesheet", "timesheet_id")
    }
}

module.exports = VTimeSheet
