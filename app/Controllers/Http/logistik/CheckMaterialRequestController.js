'use strict'

const { async } = require('crypto-random-string')
const _ = require('underscore')
const MasBarang = use("App/Models/MasBarang")
const MasEquipment = use("App/Models/MasEquipment")
const MasDepartment = use("App/Models/MasDepartment")
const utils = use('App/Controllers/Http/customClass/utils')
const MamPurchasingRequest = use("App/Models/MamPurchasingRequest")
const LogMaterialRequestItem = use("App/Models/LogMaterialRequestItem")
const MamPurchasingRequestItem = use("App/Models/MamPurchasingRequestItem")
const MaterialRequestCheckHelpers = use('App/Controllers/Http/Helpers/MaterialRequestCheck')

class CheckMaterialRequestController {
    async index ( { view } ) {
        return view.render('logistik.material-request-check.index')
    }

    async list ( { auth, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await MaterialRequestCheckHelpers.LIST(req)
        return view.render('logistik.material-request-check.list', { list: data })
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const department = (await MasDepartment.query().where('status', 'Y').fetch()).toJSON()
        return view.render('logistik.material-request-check.create', {list: department})
    }

    async store ( { auth, request } ) {
        const req = request.all()
        req.items = JSON.parse(req.items)

        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        req.kode = await utils.GEN_KODE_MATERIAL_REQUEST(req)
        // console.log(req);

        const data = await MaterialRequestCheckHelpers.POST(req, user)
        return data
    }

    async update ( { auth, params, request } ) {
        const req = request.all()
        req.items = JSON.parse(req.items)

        console.log(req);

        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await MaterialRequestCheckHelpers.UPDATE(req, params, user)
        return data
    }

    async check ( { auth, params } ) {

        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await MaterialRequestCheckHelpers.CHECK(params, user)
        return data
    }

    async show ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await MaterialRequestCheckHelpers.SHOW(params)
        
        const department = (await MasDepartment.query().where('status', 'Y').fetch()).toJSON()
        let equipment = (await MasEquipment.query().where('site_id', data.site_id).fetch()).toJSON()


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
        return view.render('logistik.material-request-check.show', {
            data: {...data, items: data.items.map( obj => {
                return {
                    ...obj,
                    listBarang: barang,
                    listEquipment: equipment
                }
            })}, 
            list: department
        })
    }

    async view ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const barang = (await MasBarang.query().where('aktif', 'Y').fetch()).toJSON()
        const data = await MaterialRequestCheckHelpers.SHOW(params)

        const purchReq = (
            await MamPurchasingRequestItem.query()
            .with('barang')
            .where('mr_id', params.id)
            .fetch()
        ).toJSON()
        return view.render('logistik.material-request-check.view', {
            data: data,
            purchasingReq: purchReq,
            barang: barang
        })
    }

    async checkItems ( { request } ) {
        const req = request.all()
        let barang = await MasBarang.query()
        .where( w => {
            w.where('partnumber', req.kode)
        }).last()

        if (!barang) {
            barang = await MasBarang.query()
            .where( w => {
                w.where('kode', req.kode)
            }).last()
        }

        barang = barang?.toJSON() || null
        console.log(barang);

        let materialRequestItem = null
        let success = false
        if(barang){
            materialRequestItem = (
                await LogMaterialRequestItem.query().where( w => {
                    w.where('material_req_id', req.id)
                    w.where('barang_id', barang.id)
                }).last()
            )?.toJSON()

            if(materialRequestItem){
                success = true
            }
        }
        return {
            success: success,
            barang: barang,
            itemRequest: materialRequestItem
        }
    }

    async barangOut ( { auth, params, request } ) {
        let req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        req.items = JSON.parse(req.items)

        let items = _.groupBy(req.items, 'barang_id')
        items = Object.keys(items).map(key => {
            return {
                barang_id: key,
                equipment_id: items[key][0].equipment_id,
                qty: items[key].reduce((a, b) => {return a + parseFloat(b.qty)}, 0)
            }
        })

        req = {...req, items: items}

        if(req.items.length < 1){
            return {
                success: false,
                message: 'Items keranjang masih kosong...'
            }
        }

        const result = await MaterialRequestCheckHelpers.OUT_ITEMS(req, user)
        return result
    }

    async purchasingRequest ( { auth, params, request } ) {
        let req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        req.items = JSON.parse(req.items)

        if(!req.gudang_id){
            return {
                success: false,
                message: 'Gudang persediaan belum ditentukan...'
            }
        }

        const result = await MaterialRequestCheckHelpers.PURCHASING_REQ(params, req, user)
        return result
    }
}

module.exports = CheckMaterialRequestController

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