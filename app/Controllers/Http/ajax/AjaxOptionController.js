'use strict'

const Options = use('App/Models/SysOption')

class AjaxOptionController {
    async index ({request}) {
        const req = request.all()
        let list = (await Options.query().where({group: req.group, status: 'Y'}).orderBy('urut', 'asc').fetch()).toJSON()
        if(req.selected){
            list = list.map(el => el.nilai === req.selected ? {...el, selected: 'selected'} : {...el, selected: ''})
        }else{
            list.unshift({id: '', nilai: '', teks: 'Pilih', selected: 'selected', group: req.group})
        }

        return list
    }

  async getDepartment({ request }) {
    const req = request.all()
    const options = (await Options.query().where({ group: 'department', status: 'Y' }).fetch()).toJSON()
    // console.log(list)
    return {
      data: options
    }
  }
}

module.exports = AjaxOptionController
