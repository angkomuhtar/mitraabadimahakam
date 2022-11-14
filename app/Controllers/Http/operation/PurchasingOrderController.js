'use strict'

const _ = use('underscore')
const moment = require('moment')
const MasBarang = use("App/Models/MasBarang")
const MasSupplier = use("App/Models/MasSupplier")
const utils = use('App/Controllers/Http/customClass/utils')
const BarangHelpers = use('App/Controllers/Http/Helpers/Barang')
const PurchaseOrderHelpers = use('App/Controllers/Http/Helpers/PurchasingOrder')

class PurchasingOrderController {
    async index ( { view } ) {
        return view.render('operation.purchasing-order.index')
    }

    async list ( { auth, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await PurchaseOrderHelpers.LIST(req)
        return view.render('operation.purchasing-order.list', { list: data })
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        return view.render('operation.purchasing-order.create')
    }

    async view ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await PurchaseOrderHelpers.SHOW(params)
        const vendor = (await MasSupplier.query().where('status', 'Y').fetch()).toJSON()
        let barang = (await MasBarang.query().where('aktif', 'Y').fetch()).toJSON()

        barang = _.groupBy(barang, 'equiptype')
        barang = Object.keys(barang).map(key => {
            return {
                itemType: key,
                items: barang[key]
            }
        })

        return view.render('operation.purchasing-order.view', {
            data: data,
            barang: barang,
            vendor: vendor
        })
    }
    
    async store ( { auth, request, view } ) {
        const req = request.all()
        req.items = JSON.parse(req.items).map(el =>  ({...el, replace_with: el.replace_with === 'null' ? null:el.replace_with}))
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        console.log(req);
        const data = await PurchaseOrderHelpers.POST(req, user)
        return data
    }

    async itemCreate ( { auth, view } ) {
        
        const barang = await MasBarang.query().fetch()
        return view.render('operation.purchasing-order.items-create', {barang: barang.toJSON() || []})
    }
}

module.exports = PurchasingOrderController

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