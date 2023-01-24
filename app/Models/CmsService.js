'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsService extends Model {
    static get table(){
        return 'cms_service'
    }
}

module.exports = CmsService
