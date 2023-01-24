'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasSite extends Model {
    pit () {
        return this.hasMany('App/Models/MasPit', 'id', 'site_id')
    }
}

module.exports = MasSite
