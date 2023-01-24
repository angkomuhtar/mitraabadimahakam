'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsContentItem extends Model {
    static get table(){
        return 'cms_content_items'
    }
}

module.exports = CmsContentItem
