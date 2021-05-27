'use strict'

const Pit = use("App/Models/MasPit")

class AjaxPitController {
    async getPits ({ request }) {
        const req = request.all()
        const pit = (await Pit.query().where({sts: 'Y'}).orderBy('created_at', 'desc').fetch()).toJSON()
        const list = pit.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})

        return list
    }
}

module.exports = AjaxPitController
