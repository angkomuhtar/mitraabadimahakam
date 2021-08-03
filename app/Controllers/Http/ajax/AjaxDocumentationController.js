'use strict'

const Doc = use("App/Models/MasDocumentation")

class AjaxDocumentationController {
    async getFitur({ request }) {
        const req = request.all()
        let data = (await Doc.query().where('platform', req.platform).fetch()).toJSON()
        data = data.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : item)
        console.log(data);
        return data
    }
}

module.exports = AjaxDocumentationController
