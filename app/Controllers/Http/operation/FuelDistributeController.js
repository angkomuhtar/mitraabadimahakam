'use strict'

const FuelDistibution = use("App/Models/MamFuelDist")
const FuelDistibutionHelpers = use("App/Controllers/Http/Helpers/Fuel")

class FuelDistributeController {
    async index ({ request, view }) {
        return view.render('operation.fuel-distribution.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        const data = await FuelDistibutionHelpers.FUEL_DIST_LIST(req)
        console.log(data.toJSON());
        return view.render('operation.fuel-distribution.list', {list: data.toJSON()})
    }

    async create ({ view }) {
        return view.render('operation.fuel-distribution.create')
    }

    async store ({ request }) {
        const req = request.only([
            'site_id',
            'agen_id',
            'fuel_id',
            'no_do',
            'tgl_do',
            'no_so',
            'flow_meter',
            'no_plat',
            'sg_meter',
            'seal_top',
            'seal_bott1',
            'seal_bott2',
            'temp',
            'departure',
            'arrival',
            'truck_driver',
            'mengetahui',
            'recipient'
        ])

        const fuelDistibution = new FuelDistibution()
        fuelDistibution.fill(req)
        try {
            await fuelDistibution.save()
            return {
                success: true,
                message: 'Success save data...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Failed save data...'
            }
        }
    }
}

module.exports = FuelDistributeController
