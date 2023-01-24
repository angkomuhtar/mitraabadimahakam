'use strict'

const Pit = use("App/Models/MasPit")
const Site = use("App/Models/MasSite")

class AjaxPitController {
    async getPits ({ request }) {
        const req = request.all()
        const pit = (await Pit.query().where( w => {
            if(req.site_id){
                w.where('site_id', req.site_id)
            }
            w.where('sts', 'Y')
        }).orderBy('created_at', 'desc').fetch()).toJSON()
        const list = pit.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})

        return list
    }

    async getPitsBySite ({ request, view }) {
        const req = request.all()
        const site = (await Site.query().where('id', req.site_id).last()).toJSON()
        const pit = (await Pit.query().with('site').where( w => {
            w.where('sts', 'Y')
            w.where('site_id', req.site_id)
        }).orderBy('created_at', 'desc').fetch()).toJSON()
        const list = pit.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})
        console.log(list);
        if(req.elm === 'radiobox'){
            return view.render('_component.select-options.pit-by-site-radiobotton', {list: list, site: site})
        }else{
            return view.render('_component.select-options.pit-by-site', {list: list, site: site})
        }
    }
}

module.exports = AjaxPitController
