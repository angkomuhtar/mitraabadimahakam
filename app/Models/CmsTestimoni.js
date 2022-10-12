'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsTestimoni extends Model {
    static get table(){
        return 'cms_testimoni'
    }
}

module.exports = CmsTestimoni
