'use strict'

const SubcontHelpers = use("App/Controllers/Http/Helpers/Subcontractor")

class MasSubcontractorController {
    async index ({ view }) {
        return view.render('master.subcontractor.index')
    }

    async listSubcon ({ request, view }) {
        const req = request.all()
        const data = (await SubcontHelpers.SUBCONT_LIST(req)).toJSON()
        return view.render('master.subcontractor.list-subcon', {list : data})
    }

    async showSubcon ({ params, view }) {
        const data = (await SubcontHelpers.SUBCONT_SHOW(params)).toJSON()
        return view.render('master.subcontractor.show-subcon', {data : data})
    }

    async createSubcon ({ view }) {
        return view.render('master.subcontractor.create-subcon')
    }

    async storeSubcon ({ request, view }) {
        const req = request.only(['kode', 'name', 'email', 'phone', 'address'])
        try {
            await SubcontHelpers.SUBCONT_POST(req)
            return {
                success: true,
                message: 'Success save data...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Failed save data...'
            }
        }
    }

    async updateSubcon ({ params, request }) {
        const req = request.only(['kode', 'name', 'email', 'phone', 'address'])
        try {
            await SubcontHelpers.SUBCONT_UPDATE(params, req)
            return {
                success: true,
                message: 'Success update data...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Failed update data...'
            }
        }
    }

    async listEquipment ({ request, view }) {
        const req = request.all()
        const data = (await SubcontHelpers.EQUIPMENT_LIST(req)).toJSON()
        return view.render('master.subcontractor.list-equipment', {list: data})
    }

    async createEquipment ({ view }) {
        return view.render('master.subcontractor.create-equipment')
    }

    async showEquipment ({ params, view }) {
        const data = (await SubcontHelpers.EQUIPMENT_SHOW(params)).toJSON()
        return view.render('master.subcontractor.show-equipment', {data: data})
    }

    async storeEquipment ({ request }) {
        const req = request.only(['subcont_id', 'kode', 'brand', 'tipe'])
        try {
            await SubcontHelpers.EQUIPMENT_POST(req)
            return {
                success: true,
                message: 'Success save data...'
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed save data...'
            }
        }
    }

    async updateEquipment ({ params, request }) {
        const req = request.only(['subcont_id', 'kode', 'brand', 'tipe'])
        try {
            await SubcontHelpers.EQUIPMENT_UPDATE(params, req)
            return {
                success: true,
                message: 'Success update data...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Failed update data...'
            }
        }
    }

    async listEmployee ({ request, view }) {
        const req = request.all()
        const data = (await SubcontHelpers.EMPLOYEE_LIST(req)).toJSON()
        return view.render('master.subcontractor.list-employee', {list: data})
    }

    async createEmployee ({ view }) {
        return view.render('master.subcontractor.create-employee')
    }

    async showEmployee ({ params, view }) {
        const data = (await SubcontHelpers.EMPLOYEE_SHOW(params)).toJSON()
        return view.render('master.subcontractor.show-employee', {data: data})
    }

    async storeEmployee ({ request }) {
        const req = request.only(['subcont_id', 'fullname', 'position'])
        try {
            await SubcontHelpers.EMPLOYEE_POST(req)
            return {
                success: true,
                message: 'Success save data...'
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed save data...'
            }
        }
    }

    async updateEmployee ({ params, request }) {
        const req = request.only(['subcont_id', 'fullname', 'position'])
        try {
            await SubcontHelpers.EMPLOYEE_UPDATE(params, req)
            return {
                success: true,
                message: 'Success update data...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Failed update data...'
            }
        }
    }
}

module.exports = MasSubcontractorController
