'use strict'

// const User = use('App/Models/User')
const Database = use('Database');


class PitApiController {
    async getAllPit({ request, response }) {
        try {

            const getAllPit = await (Database
                .from('mas_pits')
                .select('kode')
                .select('name')
                .select('id')
                .where('sts', 'Y'));


            return response.status(201).json({
                data: getAllPit,
            });

        } catch (error) {
            return response.status(404).json({
                data: null,
            })
        }
    }

    async getUnitActivitesBasedOnPit({ request, response }) {
        try {

            const { pit_id } = request.all();

            const getUnitActivities = await (Database
                .raw('select mua.is_stopped_operation as is_operation_stopped, mua.job, mua.total_rotation_during_shift as ritase, ms.kode as shift, me.kode as unit_kode, muae.hour, muae.event_name, mf.fleet_name as fleet from mas_fleets mf, mas_pits mp, mas_unit_activities mua, mas_unit_activities_events muae, mas_equipments me, mas_shifts ms where me.id = mua.unit_id && ms.id = mua.at_shift && ms.id = muae.at_shift && mp.id = mf.pit_id && mp.id = muae.pit_id && mf.id = muae.fleet_id && mua.id = muae.unit_activities_id && mp.id = ?', [pit_id]));
            
            const sqlResult = getUnitActivities[0];
            
            let result = {};

            await sqlResult.map(async (v,i) => {
                result[v.fleet] = [sqlResult.filter((x,y) => x.fleet === v.fleet)]
            });

            return response.status(201).json({
                data: result,
            });

        } catch (error) {
            console.log(error);
            return response.status(404).json({
                data: null,
            })
        }
    } 
}

module.exports = PitApiController
