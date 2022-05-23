'use strict'

const Options = use('App/Models/SysOption')

class AjaxOptionController {
<<<<<<< HEAD
  async index({ request }) {
    const req = request.all()
    const options = (await Options.query().where({ group: req.group, status: 'Y' }).fetch()).toJSON()
    const list = options.map(el => (el.nilai === req.selected ? { ...el, selected: 'selected' } : { ...el, selected: '' }))
    // console.log(list)
    return list
  }
=======
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
>>>>>>> b2e2f20f6ca41bbb106fe87510a05c0df7dd5dbc

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
