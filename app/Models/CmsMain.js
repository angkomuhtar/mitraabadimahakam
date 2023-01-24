'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsMain extends Model {
    static get table(){
        return 'cms_main'
    }
}

module.exports = CmsMain
