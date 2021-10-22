'use strict'

const Fleet = use("App/Models/MasFleet")

class AjaxFleetController {
    async getFleets ({ request }) {
        const req = request.all()
        const fleet = (await Fleet.query().where({status: 'Y'}).orderBy('created_at', 'desc').fetch()).toJSON()
        const list = fleet.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})

        return list
    }

    async getFleetsByTipe ({ request }) {
        const req = request.all()
        const fleet = (await Fleet.query().where({status: 'Y', tipe: req.tipe}).orderBy('created_at', 'desc').fetch()).toJSON()
        const list = fleet.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})

        return list
    }
}

module.exports = AjaxFleetController
