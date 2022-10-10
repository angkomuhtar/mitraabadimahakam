'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsFeature extends Model {
    static get table(){
        return 'cms_feature'
    }
}

module.exports = CmsFeature
