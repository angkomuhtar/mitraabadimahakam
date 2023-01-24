'use strict'

const MasDocumentation = use("App/Models/MasDocumentation")
const MasDocumentationDetail = use("App/Models/MasDocumentationDetail")

class WebappsDocumentController {
    async index ({ view }) {
        const doc = (
            await MasDocumentation
            .query()
            .with('details')
            .where({platform: 'web', aktif: 'Y'})
            .orderBy('urut')
            .fetch()
        ).toJSON()
        return view.render('documentation.web.index', {list: doc})
    }
}

module.exports = WebappsDocumentController
