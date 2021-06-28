'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyRitase extends Model {
    daily_fleet(){
        return this.belongsTo("App/Models/DailyFleet", "dailyfleet_id", "id")
    }

    material_details(){
        return this.belongsTo("App/Models/MasMaterial", "material", "id")
    }

    ritase_details(){
        return this.hasMany("App/Models/DailyRitaseDetail", "id", "dailyritase_id")
    }
}

module.exports = DailyRitase
