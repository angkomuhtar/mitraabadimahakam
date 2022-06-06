'use strict'
const db = use('Database')
const moment = require('moment')
const Barang = use("App/Models/MasBarang")
const PurchasingRequest = use("App/Models/MamPurchasingRequest")
const PurchasingRequestItem = use("App/Models/MamPurchasingRequestItem")


class mamPurchasingRequest {
    async LIST (req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const purchasingRequest = await PurchasingRequest.query()
        .with('mengetahui')
        .with('site')
        .with('items')
        .where( w  => {
            if (req.kode) {
                w.where('kode', req.kode)
            }
            if (req.department) {
                w.where('department', req.department)
            }
            if (req.type) {
                w.where('type', req.type)
            }
            if (req.priority) {
                w.where('priority', priority)
            }
        }).orderBy([{column: 'date', order: 'desc'}, {column: 'kode', order: 'asc'}]).paginate(halaman, limit)
        return purchasingRequest.toJSON()
    }
    
    async SHOW (params) {
        const purchasingRequest = await PurchasingRequest.query().with('author').with('mengetahui').with('site').with('items').where('id', params.id).last()
        console.log(purchasingRequest.toJSON());
        return purchasingRequest.toJSON()
    }

    async POST (req, user) {

        const trx = await db.beginTransaction()

        let purchasingRequest
        let purchasingRequestItem

        try {
            purchasingRequest = new PurchasingRequest()
            purchasingRequest.fill({
                site_id: req.site_id || null,
                kode: req.kode,
                date: moment(req.date).format('YYYY-MM-DD HH:mm'),
                department: req.department,
                priority: req.priority,
                createdby: user.id
            })
            await purchasingRequest.save(trx)
        } catch (error) {
            console.log(error);
            await trx.rollback()
            return {
                success: false,
                message: 'Failed save Purchasing Requesting,,,'
            }
        }

        for (const obj of req.items) {

            const barang = await Barang.query().where('id', obj.barang_id).last()

            try {
                purchasingRequestItem = new PurchasingRequestItem()
                purchasingRequestItem.fill({
                    request_id: purchasingRequest.id,
                    barang_id: barang.id,
                    kode: barang.kode,
                    partnumber: barang.partnumber,
                    descriptions: barang.descriptions,
                    satuan: barang.uom,
                    qty: obj.qty,
                    equipment_id: obj.equipment_id || null,
                    remark: obj.remark
                })
                await purchasingRequestItem.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed save Purchasing Requesting Items,,,'
                }
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success save Purchasing Requesting,,,'
        }
    }
}

module.exports = new mamPurchasingRequest()