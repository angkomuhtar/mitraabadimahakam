'use strict'

const _ = use('underscore')
const moment = require('moment')
const MasBarang = use("App/Models/MasBarang")
const MasSupplier = use("App/Models/MasSupplier")
const MasDepartment = use("App/Models/MasDepartment")
const utils = use('App/Controllers/Http/customClass/utils')
const BarangHelpers = use('App/Controllers/Http/Helpers/Barang')
const PurchaseRequestHelpers = use('App/Controllers/Http/Helpers/PurchasingRequest')

class PurchasingRequestController {
    async index ( { view } ) {
        return view.render('operation.purchasing-request.index')
    }

    async list ( { auth, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await PurchaseRequestHelpers.LIST(req)
        return view.render('operation.purchasing-request.list', { list: data })
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const department = (await MasDepartment.query().where('status', 'Y').fetch()).toJSON()
        return view.render('operation.purchasing-request.create', {department: department})
    }

    async view ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await PurchaseRequestHelpers.SHOW(params)
        const vendor = (await MasSupplier.query().where('status', 'Y').fetch()).toJSON()
        let barang = (await MasBarang.query().where('aktif', 'Y').fetch()).toJSON()

        barang = _.groupBy(barang, 'equiptype')
        barang = Object.keys(barang).map(key => {
            return {
                itemType: key,
                items: barang[key]
            }
        })

        return view.render('operation.purchasing-request.view', {
            data: data,
            barang: barang,
            vendor: vendor
        })
    }
    
    async store ( { auth, request, view } ) {
        const req = request.all()
        const data = JSON.parse(req.data)
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        if(!data.site_id){
            return {
                success: false,
                message: 'Data site belum di tentukan...'
            }
        }
        if(!data.priority){
            return {
                success: false,
                message: 'Status priority belum di tentukan...'
            }
        }
        if(!data.department){
            return {
                success: false,
                message: 'Department belum di tentukan...'
            }
        }

        const kode = await utils.GEN_KODE_PURCHASING_ORDER(data.site_id)
        data.kode = kode
        const result = await PurchaseRequestHelpers.POST(data, user)

        return result
    }

    async destroy ( { auth, params } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        
        const result = await PurchaseRequestHelpers.DELETE(params)
        return result
    }

    async itemCreate ( { auth, view } ) {
        
        const barang = await MasBarang.query().fetch()
        return view.render('operation.purchasing-request.items-create', {barang: barang.toJSON() || []})
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