'use strict'

class FuelDistributeController {
    async index ({ request, view }) {
        return view.render('operation.fuel-distribution.index')

    }
}

module.exports = FuelDistributeController
