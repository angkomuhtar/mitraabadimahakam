'use strict'

class MobileappsDocumentController {
    async index ({ view }) {
        return view.render('404')
    }
}

module.exports = MobileappsDocumentController
