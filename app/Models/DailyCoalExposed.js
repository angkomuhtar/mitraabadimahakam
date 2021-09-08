'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyCoalExposed extends Model {

    pit () {
        return this.belongsTo("App/Models/MasPit", "pit_id", "id")
    }

    createdby () {
        return this.belongsTo("App/Models/VUser", "created_by", "id")
    }
}

module.exports = DailyCoalExposed
