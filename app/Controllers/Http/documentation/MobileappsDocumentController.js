'use strict'

class MobileappsDocumentController {
    async index ({ params, view }) {
        const { token } = params
        return view.render('mobile-documentation')
    }
}

module.exports = MobileappsDocumentController
