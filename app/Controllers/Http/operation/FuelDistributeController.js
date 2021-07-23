'use strict'

class FuelDistributeController {
    async index ({ request, view }) {
        return view.render('operation.fuel-distribution.index')
    }

    async list ({ request, view }) {
        return view.render('operation.fuel-distribution.list')
    }

    async create ({ view }) {
        return view.render('operation.fuel-distribution.create')

    }
}

module.exports = FuelDistributeController
