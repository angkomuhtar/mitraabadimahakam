'use strict'

const _ = require('underscore')
const MasBarang = use("App/Models/MasBarang")
const MasEquipment = use("App/Models/MasEquipment")
const MasDepartment = use("App/Models/MasDepartment")
const utils = use('App/Controllers/Http/customClass/utils')
const MaterialRequestHelpers = use('App/Controllers/Http/Helpers/MaterialRequest')

class MaterialRequestController {
    async index ( { view } ) {
        return view.render('logistik.material-request.index')
    }

    async list ( { auth, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await MaterialRequestHelpers.LIST(req)
        return view.render('logistik.material-request.list', { list: data })
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const department = (await MasDepartment.query().where('status', 'Y').fetch()).toJSON()
        return view.render('logistik.material-request.create', {list: department})
    }

    async createItems ( { auth, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        req.length = parseInt(req.length) + 1

        let equipment = (await MasEquipment.query().where('site_id', req.site_id).fetch()).toJSON()

        equipment = _.groupBy(equipment, 'tipe')
        equipment = Object.keys(equipment).map(key => {
            return {
                type: key,
                items: equipment[key]
            }
        })

        let barang = (await MasBarang.query().where('aktif', 'Y').fetch()).toJSON()

        barang = _.groupBy(barang, 'equiptype')
        barang = Object.keys(barang).map(key => {
            return {
                type: key,
                items: barang[key]
            }
        })

        const HTML = '<tr class="item-details">'+
            '    <td>'+req.length+'</td>'+
            // '    <td>'+
            // '        <div class="form-group" style="margin-bottom:5px">'+
            // '            <select class="form-control custom-option" data-title="uom" data-check="" name="material-type">'+
            // '               <option value="">Pilih Item Type</option>'+
            // '               <option value="SPARE PART">SPARE PART</option>'+
            // '               <option value="CONSUMABLE">CONSUMABLE</option>'+
            // '               <option value="F&B">F&B</option>'+
            // '               <option value="OTHERS">OTHERS</option>'+
            // '            </select>'+
            // '        </div>'+
            // '    </td>'+
            '    <td>'+
            '        <div class="form-group" style="margin-bottom:5px">'+
            '            <select class="form-control" name="equipment_reff">'+
            '               <option value="">Pilih Item Request</option>'+
                                barang.map( v => '<optgroup label="'+v.type+'">'+v.items.map(i => '<option type="'+i.equiptype+'" value="'+i.id+'">'+`[ ${i.kode} ] ${i.descriptions}  ${i.partnumber ? '-- partNum: '+i.partnumber : ''} `+'</option>')+'</optgroup>')+
            '            </select>'+
            '        </div>'+
            '    </td>'+
            '    <td>'+
            '        <div class="form-group" style="margin-bottom:5px">'+
            '            <input class="form-control" type="number" name="qty" value="1"/>'+
            '        </div>'+
            '    </td>'+
            '    <td>'+
            '        <div class="form-group" style="margin-bottom:5px">'+
            '            <select class="form-control" name="equipment_reff">'+
            '               <option value="">Pilih Equipment</option>'+
                                equipment.map( v => '<optgroup label="'+v.type+'">'+v.items.map(i => '<option value="'+i.id+'">'+i.kode+'</option>')+'</optgroup>')+
            '            </select>'+
            '        </div>'+
            '    </td>'+
            '    <td class="text-center">'+
            '        <button type="button" class="btn btn-danger btn-circle remove-items">'+
            '            <i class="icon-trash text-white"></i>'+
            '        </button>'+
            '    </td>'+
            '</tr>';
        return HTML
    }
}

module.exports = MaterialRequestController

async function userValidate(auth){
    let user
    try {
        user = await auth.getUser()
        return user
    } catch (error) {
        console.log(error);
        return null
    }
}