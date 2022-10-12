'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmsFact extends Model {
    static get table(){
        return 'cms_fact'
    }
}

module.exports = CmsFact
