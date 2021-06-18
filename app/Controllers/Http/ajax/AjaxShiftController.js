'use strict'

const Shift = use("App/Models/MasShift")

class AjaxShiftController {
    async getShift ({ request }) {
        const req = request.all()
        const shift = (await Shift.query().where({status: 'Y'}).orderBy('created_at', 'desc').fetch()).toJSON()
        const list = shift.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})

        return list
    }

    async getShiftID ({ params }) {
        const { id } = params
        const shift = await Shift.findOrFail(id)
        return shift
    }
}

module.exports = AjaxShiftController
