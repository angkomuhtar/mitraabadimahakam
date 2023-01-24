'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsLang extends Model {
    static get table(){
        return 'cms_lang'
    }
}

module.exports = CmsLang
