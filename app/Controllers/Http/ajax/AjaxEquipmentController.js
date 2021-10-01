'use strict'

const EquipmentHelpers = use("App/Controllers/Http/Helpers/Equipment")

class AjaxEquipmentController {
    async getEquipment ({ request }) {
        const req = request.all()
        const equipment = (await EquipmentHelpers.ALL(req)).toJSON()
        // console.log('equipment ::', equipment);
        const data = equipment.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        return data
    }

    async getEquipmentFuelTruck ({ request }) {
        const req = request.all()
        const equipment = (await EquipmentHelpers.FUEL_TRUCK()).toJSON()
        // console.log('equipment ::', equipment);
        const data = equipment.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        return data
    }
}

module.exports = AjaxEquipmentController
