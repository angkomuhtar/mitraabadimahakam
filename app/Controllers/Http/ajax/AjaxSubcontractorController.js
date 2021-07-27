'use strict'

const SubcontHelpers = use("App/Controllers/Http/Helpers/Subcontractor")

class AjaxSubcontractorController {
    async getSubcon ({ request }) {
        const req = request.all()
        let data = (await SubcontHelpers.SUBCONT_OPTIONS()).toJSON()
        if(data.length > 0){
            data = data.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : item)
            return data
        }else{
            return []
        }
    }
}

module.exports = AjaxSubcontractorController
