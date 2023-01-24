'use strict'

const _ = require('underscore')
const MasBarang = use("App/Models/MasBarang")
const MamBarangIn = use("App/Models/MamBarangIn")
const MamBarangOut = use("App/Models/MamBarangOut")
const MasEquipment = use("App/Models/MasEquipment")
const MasDepartment = use("App/Models/MasDepartment")
const utils = use('App/Controllers/Http/customClass/utils')
const StockMonitoringHelpers = use('App/Controllers/Http/Helpers/StockMonitoring')

class StockMonitoringController {
    async index ( { view } ) {
        return view.render('logistik.stock-monitoring.index')
    }

    async list ( { auth, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        const data = await StockMonitoringHelpers.LIST(req)
        return view.render('logistik.stock-monitoring.list', { list: data })
    }

    async view ( { auth, params, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        

        return view.render('logistik.stock-monitoring.view')
    }

    async historyIn ( { auth, params, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await StockMonitoringHelpers.HISTORY_IN(params, req)
        return view.render('logistik.stock-monitoring.history-in', {list: data})
    }

    async historyOut ( { auth, params, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await StockMonitoringHelpers.HISTORY_OUT(params, req)
        console.log(data);
        return view.render('logistik.stock-monitoring.history-out', {list: data})
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('logistik.stock-monitoring.create')
    }

    async store ( {auth, request } ) {
        let req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }
        req.items = JSON.parse(req.items)
        console.log(req);
        const data = await StockMonitoringHelpers.POST(req, user)
        return data
    }

    async createItems ( { request, view } ){
        let req = request.all()

        let barang = (await MasBarang.query().where('aktif', 'Y').fetch()).toJSON()
        barang = _.groupBy(barang, 'equiptype')
        barang = Object.keys(barang).map(key => {
            return {
                type: key,
                items: barang[key]
            }
        })

        let equipment = (await MasEquipment.query().where( w => {
            w.where('aktif', 'Y')
            if(req.site_id){
                w.where('site_id', req.site_id)
            }
        }).fetch()).toJSON()
        equipment = _.groupBy(equipment, 'tipe')
        equipment = Object.keys(equipment).map(key => {
            return {
                type: key,
                items: equipment[key]
            }
        })

        return view.render('logistik.stock-monitoring.items-add', {
            listBarang: barang,
            listEquipment: equipment
        }) 
    }
}

module.exports = StockMonitoringController

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