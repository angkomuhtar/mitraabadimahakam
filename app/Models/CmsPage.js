'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsPage extends Model {
    static get table(){
        return 'cms_pages'
    }
}

module.exports = CmsPage
