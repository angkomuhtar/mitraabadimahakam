'use strict'

const VUser = use("App/Models/VUser")
const Akses = use("App/Models/VPrivilege")
const SysModule = use("App/Models/SysModule")

class AjaxUserAkseController {
    async getUserModule ({ request }) {
        const req = request.all()
        const data = await Akses.query().where({usertipe: req.usertipe, idmodule: req.idmodule}).first()
        // console.log(data);
        return data
    }

    async getOptionUsers ({ request }) {
        const req = request.all()
        let data = (await VUser.query().where({status: 'Y'}).fetch()).toJSON()
        if(req.selected){
            data = data.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        }
        return data
    }

    async getOptionFuelman ({ request }) {
        const req = request.all()
        let data = (await VUser.query().where({status: 'Y', user_tipe: 'fuelman'}).fetch()).toJSON()
        if(req.selected){
            data = data.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        }
        return data
    }

    async getOptionChecker ({ request }) {
        const req = request.all()
        let data = (await VUser.query().where({status: 'Y', user_tipe: 'checker'}).fetch()).toJSON()
        if(req.selected){
            data = data.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        }
        return data
    }

    async getOptionForeman ({ request }) {
        const req = request.all()
        let data = (await VUser.query().where({status: 'Y', user_tipe: 'spv'}).fetch()).toJSON()
        if(req.selected){
            data = data.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        }
        return data
    }
}

module.exports = AjaxUserAkseController
