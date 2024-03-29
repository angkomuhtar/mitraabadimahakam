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

    async getEquipmentExcavator ({ request }) {
        const req = request.all()
        const equipment = (await EquipmentHelpers.EXCAVATOR()).toJSON()
        const data = equipment.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        return data
    }

    async getEquipmentHauler ({ request }) {
        const req = request.all()
        const equipment = (await EquipmentHelpers.HAULER()).toJSON()
        const data = equipment.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        return data
    }

    async getEquipmentModel ({ request }) {
        const req = request.all()
        const equipment = await EquipmentHelpers.MODELS(req)
        console.log('====================================');
        console.log(equipment);
        console.log('====================================');
        return equipment
    }

    async getEquipmentModelOnSite ( { request } ) {
        const req = request.all()
        let equipment = await EquipmentHelpers.GET_EQUIPMENT_NAME_BY_MODEL(req.site_id, req.model)
        equipment.unshift({...equipment, id: '', kode: 'Semua Equipment dengan model terpilih', brand: ''})
        return equipment
    }
}

module.exports = AjaxEquipmentController
