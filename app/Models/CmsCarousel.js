'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsCarousel extends Model {
    static get table(){
        return 'cms_carousel'
    }
}

module.exports = CmsCarousel
