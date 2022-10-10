'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsAbout extends Model {
    static get table(){
        return 'cms_about'
    }
}

module.exports = CmsAbout
