'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyStoppageIssue extends Model {
    static get table(){
        return 'daily_stoppage_issue'
    }

    pit () {
        return this.belongsTo("App/Models/MasPit", "pit_id", "id")
    }

    event () {
        return this.belongsTo("App/Models/MasEvent", "event_id", "id")
    }

    shift () {
        return this.belongsTo("App/Models/MasShift", "shift_id", "id")
    }
    user () {
        return this.belongsTo("App/Models/User", "user_id", "id")
    }
}

module.exports = DailyStoppageIssue
