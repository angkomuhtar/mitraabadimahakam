'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsTeam extends Model {
    static get table(){
        return 'cms_team'
    }
}

module.exports = CmsTeam
