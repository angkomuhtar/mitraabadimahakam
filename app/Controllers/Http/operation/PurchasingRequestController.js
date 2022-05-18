'use strict'

const moment = require('moment')
const { format } = require('mysql')
const MasBarang = use("App/Models/MasBarang")
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
        return view.render('operation.purchasing-request.create')
    }

    async view ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await PurchaseRequestHelpers.SHOW(params)
        return view.render('operation.purchasing-request.view', {data: data})
    }
    
    async store ( { auth, request, view } ) {
        const req = request.all()
        const data = JSON.parse(req.data)
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const kode = await utils.GEN_KODE_PURCHASING_ORDER(data.site_id)
        data.kode = kode
        const result = await PurchaseRequestHelpers.POST(data, user)

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