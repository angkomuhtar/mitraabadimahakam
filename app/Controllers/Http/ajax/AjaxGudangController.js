'use strict'

const MasGudang = use("App/Models/MasGudang")

class AjaxGudangController {
    async list ({ request }) {
        const req = request.all()
        let data = (await MasGudang.query().where('aktif', 'Y').fetch()).toJSON()
        if(req.selected){
            data = data.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        }else{
            data.unshift({id: '', kode: '[X]', nama: 'Pilih Gudang'})
        }
        return data
    }

    async gudangID ({ params }) {
        const gudang = (await MasGudang.query().where('id', params.id).last()).toJSON()
        return gudang
    }
}

module.exports = AjaxGudangController
