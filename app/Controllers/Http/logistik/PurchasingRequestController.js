'use strict'

const _ = require('underscore')
const MasBarang = use("App/Models/MasBarang")
const MasEquipment = use("App/Models/MasEquipment")
const MasDepartment = use("App/Models/MasDepartment")
const utils = use('App/Controllers/Http/customClass/utils')
const PurchasingRequestHelpers = use('App/Controllers/Http/Helpers/PurchasingRequest')

class PurchasingRequestController {
    async index ( { view } ) {
        return view.render('logistik.purchasing-request.index')
    }

    async list ( { auth, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await PurchasingRequestHelpers.LIST(req)
        return view.render('logistik.purchasing-request.list', { list: data })
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const department = (await MasDepartment.query().where('status', 'Y').fetch()).toJSON()
        return view.render('logistik.purchasing-request.create', {list: department})
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

        const data = await PurchasingRequestHelpers.POST(req, user)
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

        const data = await PurchasingRequestHelpers.UPDATE(req, params, user)
        return data
    }

    async check ( { auth, params } ) {

        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await PurchasingRequestHelpers.CHECK(params, user)
        return data
    }

    async show ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await PurchasingRequestHelpers.SHOW(params)
        
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
        return view.render('logistik.purchasing-request.show', {
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
        const data = await PurchasingRequestHelpers.SHOW(params)

        const purchReq = (
            await MamPurchasingRequest.query()
            .with('items', b => b.with('barang'))
            .where('mr_id', params.id)
            .last()
        )?.toJSON()

        return view.render('logistik.purchasing-request.view', {
            data: data,
            purchasingReq: purchReq?.items,
            barang: barang
        })
    }

    async addStok ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await PurchasingRequestHelpers.SHOW(params)
        console.log(data);
        return view.render('logistik.purchasing-request.add-stock', {data: data})
    }

    async barangIn ( { auth, params, request } ) {
        let req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        req = JSON.parse(req.data)
        // console.log('FORM RECEIVED :::', req.data);
        const data = await PurchasingRequestHelpers.RECEIVED_GUDANG(params, req, user)
        return data
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

        const result = await PurchasingRequestHelpers.OUT_ITEMS(req, user)
        return result
    }

    async purchasingRequest ( { auth, params, request } ) {
        let req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        req.items = JSON.parse(req.items)
        console.log(req, params);

        if(!req.gudang_id){
            return {
                success: false,
                message: 'Gudang persediaan belum ditentukan...'
            }
        }

        const result = await PurchasingRequestHelpers.PURCHASING_REQ(params, req, user)
        return result
    }
}

module.exports = PurchasingRequestController

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