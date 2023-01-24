'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class VDailyEvent extends Model {
    static get table(){
        return 'v_daily_event'
    }
}

module.exports = VDailyEvent
