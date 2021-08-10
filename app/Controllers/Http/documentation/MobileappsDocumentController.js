'use strict'

const MasDocumentation = use("App/Models/MasDocumentation")

class MobileappsDocumentController {
    async index ({ params, view }) {
        const { token } = params

        const mobileApps = (await MasDocumentation.query().with('details').where('platform', 'mobile').andWhere('aktif', 'Y').orderBy('urut').fetch()).toJSON()
        console.log(mobileApps);
        return view.render('mobile-documentation', {list: mobileApps})
    }
}

module.exports = MobileappsDocumentController
