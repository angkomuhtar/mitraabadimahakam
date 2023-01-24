'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SysUserApp extends Model {
    static get table(){
        return 'sys_apps'
    }
}

module.exports = SysUserApp
