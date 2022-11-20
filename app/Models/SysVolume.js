'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SysVolume extends Model {
    static get table(){
        return 'sys_volume'
    }
}

module.exports = SysVolume
