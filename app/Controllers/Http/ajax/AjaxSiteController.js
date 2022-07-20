'use strict'

const Sites = use("App/Models/MasSite")

class AjaxSiteController {
    async getSites ({request}) {
        const req = request.all()
        console.log('====================================');
        console.log(req);
        console.log('====================================');
        let data = (await Sites.query().where({status: 'Y'}).fetch()).toJSON()
        if(req.selected){
            data = data.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})
            data.unshift({id: '', name: 'Pilih', selected: ''})
        }else{
            data.unshift({id: '', name: 'Pilih', selected: 'selected'})
        }
        
        return data
    }
    
    async getSiteByID ( {params} ) {
        let site = (await Sites.query().with('pit').where('id', params.id).last())?.toJSON()
        site = {...site, pit: site.pit.filter(el => el.sts === 'Y')}
        return site
    }
}

module.exports = AjaxSiteController
