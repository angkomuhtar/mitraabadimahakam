'use strict'

const MasDepartment = use("App/Models/MasDepartment")

class AjaxDepartmentController {
    async list ({ request }) {
        const req = request.all()
        let data = (await MasDepartment.query().where('status', 'Y').fetch()).toJSON()
        if(req.selected){
            data = data.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        }else{
            data.unshift({id: '', kode: '[X]', nama: 'Pilih Department'})
        }
        // console.log('DEPT ::', data);
        return data
    }

    async departmentID ({ params }) {
        const dept = (await MasDepartment.query().where('id', params.id).last()).toJSON()
        return dept
    }
}

module.exports = AjaxDepartmentController
