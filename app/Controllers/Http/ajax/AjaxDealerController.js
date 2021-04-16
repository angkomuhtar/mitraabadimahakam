'use strict'

const Dealer = use("App/Models/MasDealer")

class MasDealerController {
    async getDealers ({request}) {
        const req = request.all()
        const dealer = (await Dealer.query().fetch()).toJSON()
        const list = dealer.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})
        
        return list
    }

    async getDealerId ({params}) {
        const { id } = params
        const dealer = (await Dealer.findOrFail(id)).toJSON()
        return dealer
    }
}

module.exports = MasDealerController
