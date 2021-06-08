'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyCheckp2H extends Model {
    static get table(){
        return 'daily_checkp2h'
    }
}

module.exports = DailyCheckp2H
