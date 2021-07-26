'use strict'

class MasSubcontractorController {
    async index ({ view }) {
        return view.render('master.subcontractor.index')
    }

    async list ( { request, view }) {
        return view.render('master.subcontractor.list')
    }
}

module.exports = MasSubcontractorController
