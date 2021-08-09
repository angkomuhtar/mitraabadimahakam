'use strict'

class MobileappsDocumentController {
    async index ({ params, view }) {
        const { token } = params
        return view.render('404')
    }
}

module.exports = MobileappsDocumentController
