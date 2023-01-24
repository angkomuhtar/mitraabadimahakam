'use strict'

const Doc = use("App/Models/MasDocumentation")

class AjaxDocumentationController {
    async getPlatform({ request }) {
        const req = request.all()
        let data = [
            {id: 'web', name: 'WEB APPS'},
            {id: 'mobile', name: 'MOBILE APPS'}
        ]
        if(req.selected){
            data = data.map(item => item.id === req.selected ? {...item, selected: 'selected'} : {...item, selected: ''})
        }

        return data
    }

    async getFitur({ request }) {
        const req = request.all()
        let data = (await Doc.query().where('platform', req.platform).fetch()).toJSON()
        data = data.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        console.log(data);
        return data
    }
}

module.exports = AjaxDocumentationController
