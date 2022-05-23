'use strict'

const Sites = use("App/Models/MasSite")

class AjaxSiteController {
    async getSites ({request}) {
        const req = request.all()
        const site = (await Sites.query().where({status: 'Y'}).fetch()).toJSON()
        const list = site.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})
        
        return list
    }
    
    async getSiteByID ( {params} ) {
        let site = (await Sites.query().with('pit').where('id', params.id).last())?.toJSON()
        site = {...site, pit: site.pit.filter(el => el.sts === 'Y')}
        return site
    }
}

module.exports = AjaxSiteController
