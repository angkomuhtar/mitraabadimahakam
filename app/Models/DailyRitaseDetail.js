'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyRitaseDetail extends Model {
    static boot () {
        super.boot()
        this.addHook('beforeCreate', 'DailyRitaseDetail.beforeInsertData')
        this.addHook('beforeUpdate', 'DailyRitaseDetail.beforeUpdateData')
    }
}

module.exports = DailyRitaseDetail
