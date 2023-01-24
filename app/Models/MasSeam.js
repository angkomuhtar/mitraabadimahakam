'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasSeam extends Model {
    pit () {
        return this.belongsTo("App/Models/MasPit", "pit_id", "id")
    }
}

module.exports = MasSeam
