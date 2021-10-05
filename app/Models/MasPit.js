'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasPit extends Model {
    site () {
        return this.belongsTo("App/Models/MasSite", "site_id", "id")
    }

    seam(){
        return this.hasMany('App/Models/MasSeam', 'id', 'pit_id')
    }
}

module.exports = MasPit
