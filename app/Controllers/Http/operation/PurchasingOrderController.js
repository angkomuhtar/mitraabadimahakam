'use strict'

const _ = use('underscore')
const moment = require('moment')
const MasBarang = use("App/Models/MasBarang")
const MasSupplier = use("App/Models/MasSupplier")
const MasEquipment = use("App/Models/MasEquipment")
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
        // console.log(data);
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

        let data = await PurchaseOrderHelpers.SHOW(params)

        let vendor = (await MasSupplier.query().where('status', 'Y').fetch()).toJSON()
        let barang = (await MasBarang.query().where('aktif', 'Y').fetch()).toJSON()
        let equipment = (await MasEquipment.query().where('aktif', 'Y').fetch()).toJSON()

        data.items = data.items.map(el => {
            return {
                ...el,
                replace_alt: barang.map(obj => {
                    return {
                        ...obj,
                        selected: obj.id === el.replace_with ? 'selected': ''
                    }
                }),
                barang_ori: barang.map(val => {
                    return {
                        ...val,
                        selected: val.id === el.barang_id ? 'selected': ''
                    }
                })
            }
        })

        // console.log(data.items);
        return view.render('operation.purchasing-order.view', {
            data: data,
            equipment: equipment,
            vendor: vendor.map(el => el.id === data.vendor_id ? {...el, selected: 'selected'}:{...el, selected: ''})
        })
    }

    async receive ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        
        let data = await PurchaseOrderHelpers.SHOW(params)
        
        let vendor = (await MasSupplier.query().where('status', 'Y').fetch()).toJSON()
        let barang = (await MasBarang.query().where('aktif', 'Y').fetch()).toJSON()
        let equipment = (await MasEquipment.query().where('aktif', 'Y').fetch()).toJSON()
        
        moment.locale("id")
        data.items = data.items.map(el => {
            return {
                ...el,
                est_received: moment(el.est_received).format('dddd, DD MMMM YYYY'),
                replace_alt: barang.map(obj => {
                    return {
                        ...obj,
                        selected: obj.id === el.replace_with ? 'selected': ''
                    }
                }),
                barang_ori: barang.map(val => {
                    return {
                        ...val,
                        selected: val.id === el.barang_id ? 'selected': ''
                    }
                })
            }
        })

        // console.log(data.items);
        return view.render('operation.purchasing-order.receive', {
            data: data,
            equipment: equipment,
            vendor: vendor.map(el => el.id === data.vendor_id ? {...el, selected: 'selected'}:{...el, selected: ''})
        })
    }

    async delivering ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        
        let data = await PurchaseOrderHelpers.SHOW(params)
        
        let vendor = (await MasSupplier.query().where('status', 'Y').fetch()).toJSON()
        let barang = (await MasBarang.query().where('aktif', 'Y').fetch()).toJSON()
        let equipment = (await MasEquipment.query().where('aktif', 'Y').fetch()).toJSON()
        
        moment.locale("id")
        data.items = data.items.map(el => {
            return {
                ...el,
                est_received: moment(el.est_received).format('dddd, DD MMMM YYYY'),
                replace_alt: barang.map(obj => {
                    return {
                        ...obj,
                        selected: obj.id === el.replace_with ? 'selected': ''
                    }
                }),
                barang_ori: barang.map(val => {
                    return {
                        ...val,
                        selected: val.id === el.barang_id ? 'selected': ''
                    }
                })
            }
        })

        // console.log(data.items);
        return view.render('operation.purchasing-order.deliver', {
            data: data,
            equipment: equipment,
            vendor: vendor.map(el => el.id === data.vendor_id ? {...el, selected: 'selected'}:{...el, selected: ''})
        })
    }
    
    async store ( { auth, request, view } ) {
        const req = request.all()
        req.items = JSON.parse(req.items).map(el =>  ({...el, replace_with: el.replace_with === 'null' ? null:el.replace_with}))
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await PurchaseOrderHelpers.POST(req, user)
        return data
    }

    async update ( { auth, params, request } ) {
        let req = request.all()
        req = JSON.parse(req.data)
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        // console.log(JSON.stringify(req, null, 2));

        const data = await PurchaseOrderHelpers.UPDATE(params, req, user)
        return data
    }

    async received ( { auth, params, request } ) {
        let req = request.all()
        req = JSON.parse(req.data)
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        // console.log(JSON.stringify(req, null, 2));

        const data = await PurchaseOrderHelpers.RECEIVED(params, req, user)
        return data
    }

    async delivered ( { auth, params, request } ) {
        let req = request.all()
        req = JSON.parse(req.data)
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        if(!req.spj){
            return {
                success: false,
                message: 'Nomor Surat Jalan Blum terisi....'
            }
        }

        if(!req.delman){
            return {
                success: false,
                message: 'Nama kurir belum terisi....'
            }
        }

        console.log(JSON.stringify(req, null, 2));

        const data = await PurchaseOrderHelpers.DELIVERED(params, req, user)
        return data
    }

    async printOrder ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await PurchaseOrderHelpers.SHOW(params)
        console.log(data);
        return view.render('operation.purchasing-order.print-po', {data: data})
    }

    async viewPrint ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await PurchaseOrderHelpers.SHOW(params)
        console.log(data);
        return view.render('operation.purchasing-order.view-surat-jalan', {data: data})
    }

    async destroyItems ( { auth, params } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await PurchaseOrderHelpers.DELETE_ITEMS(params)
        return data
    }

    async itemCreate ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const barang = (await MasBarang.query().fetch()).toJSON() || []
        const equipment = (await MasEquipment.query().where('aktif', 'Y').fetch()).toJSON()
        return view.render('operation.purchasing-order.items-create', {
            barang: barang,
            equipment: equipment
        })
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