'use strict'

const RefuelUnitHelpers = use("App/Controllers/Http/Helpers/Fuel")

class DailyRefuelEquipmentController {
    async index ({ auth, view }) {
        return view.render('operation.daily-refuel-unit.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        const data = await RefuelUnitHelpers.LIST_REFUEL_UNIT(req)
        // console.log(data.toJSON());
        return view.render('operation.daily-refuel-unit.list', {list: data.toJSON()})
    }
}

module.exports = DailyRefuelEquipmentController
