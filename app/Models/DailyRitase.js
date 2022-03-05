'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyRitase extends Model {
    static boot () {
        super.boot()
        this.addHook('beforeCreate', 'DailyRitaseHook.beforeInsertData')
    }
    daily_fleet(){
        return this.belongsTo("App/Models/DailyFleet", "dailyfleet_id", "id")
    }

    pit(){
        return this.belongsTo("App/Models/MasPit", "pit_id", "id")
    }

    shift(){
        return this.belongsTo("App/Models/MasShift", "shift_id", "id")
    }

    material_details(){
        return this.belongsTo("App/Models/MasMaterial", "material", "id")
    }

    unit(){
        return this.belongsTo("App/Models/MasEquipment", "exca_id", "id")
    }

    ritase_details(){
        return this.hasMany("App/Models/DailyRitaseDetail", "id", "dailyritase_id")
    }
}

module.exports = DailyRitase
