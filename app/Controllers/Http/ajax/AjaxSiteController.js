'use strict'

const Sites = use("App/Models/MasSite")

class AjaxSiteController {
    async getSites ({request}) {
        const req = request.all()
        const site = (await Sites.query().where({status: 'Y'}).fetch()).toJSON()
        const list = site.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})
        
        return list
    }
}

module.exports = AjaxSiteController
