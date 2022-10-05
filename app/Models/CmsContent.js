'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsContent extends Model {
    static get table(){
        return 'cms_content'
    }

    items () {
        return this.hasMany("App/Models/CmsContentItem", "id", "content_id")
    }
}

module.exports = CmsContent
