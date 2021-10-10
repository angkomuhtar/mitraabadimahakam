'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class VRitaseObPerjam extends Model {
    static get table(){
        return 'v_ritase_ob_perjam'
    }

    dailyritase () {
        return this.belongsTo("App/Models/DailyRitase", "dailyritase_id", "id")
    }

    hauler () {
        return this.belongsTo("App/Models/MasEquipment", "hauler_id", "id")
    }

    material () {
        return this.belongsTo("App/Models/MasMaterial", "material_id", "id")
    }
}

module.exports = VRitaseObPerjam
