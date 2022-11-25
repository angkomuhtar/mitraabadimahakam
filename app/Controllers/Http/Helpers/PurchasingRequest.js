'use strict'
const db = use('Database')
const moment = require('moment')
const Barang = use("App/Models/MasBarang")
const MamBarangIn = use("App/Models/MamBarangIn")
const MamBarangStok = use("App/Models/MamBarangStok")
const PurchasingRequest = use("App/Models/MamPurchasingRequest")
const PurchasingRequestItem = use("App/Models/MamPurchasingRequestItem")


class mamPurchasingRequest {
    async LIST (req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const purchasingRequest = await PurchasingRequest.query()
        .with('mengetahui')
        .with('site')
        .with('dept')
        .with('items')
        .where( w  => {
            w.where('aktif', 'Y')
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
        const purchasingRequest = await PurchasingRequest.query()
        .with('author')
        .with('mengetahui')
        .with('site')
        .with('dept')
        .with('items', i => {
            i.with('barang')
            i.with('replaceWith')
            i.with('equipment')
        })
        .where('id', params.id).last()
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
                createdby: user.id,
                description: req.description
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

    async RECEIVED_GUDANG (params, req, user) {
        console.log(params);
        console.log(req);
        const trx = await db.beginTransaction()

        const PR = await PurchasingRequest.query().where('id', params.id).last()

        /** TAMBAH STOK GUDANG **/
        for (const obj of req.items) {
            const barangIn = new MamBarangIn()
            barangIn.fill({
                request_id: PR?.mr_id || null,
                gudang_id: req.gudang_id,
                barang_id: obj.barang_id,
                qty_in: obj.qty_received,
                date: req.receivedAt,
                created_by: user.id
            })

            try {
                await barangIn.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed adding stock gudang....'
                }
            }
        }

        for (const obj of req.items) {
            let barangStok = await MamBarangStok.query().where( w => {
                w.where('gudang_id', req.gudang_id)
                w.where('barang_id', obj.barang_id)
            }).last()
            
            if(barangStok){
                barangStok.merge({
                    remark: obj.remark || 'tanpa keterangan',
                    stok: parseFloat(barangStok.stok) + parseFloat(obj.qty_received)
                })
            }else{
                barangStok = new MamBarangStok()
                barangStok.fill({
                    barang_id: obj.barang_id,
                    gudang_id: req.gudang_id,
                    stok: obj.qty_received,
                    remark: obj.remark || 'tanpa keterangan'
                })
            }

            try {
                await barangStok.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed adding stock summary....'
                }
            }
        }

        for (const obj of req.items) {
            const updItems = await PurchasingRequestItem.query().where('id', obj.id_items).last()
            
            if(parseFloat(obj.qty_received) >= updItems.qty){
                var status = 'delivered'
            }else{
                var status = 'waiting'
            }

            updItems.merge({
                qty_received: obj.qty_received,
                status: status,
                remark: obj.remark || 'tanpa keterangan'
            })

            try {
                await updItems.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed update purchasing request items....'
                }
            }
        }
        
        try {
            const purchasingRequest = await PurchasingRequest.query().where('id', params.id).last()
            purchasingRequest.merge({
                receivedAt: req.receivedAt,
                sj: req.sj
            })
            await purchasingRequest.save(trx)
        } catch (error) {
            console.log(error);
            await trx.rollback()
            return {
                success: false,
                message: 'Failed update purchasing request....'
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success receiving item order,,,'
        }
        
    }

    async DELETE (params) {
        const purchasingRequest = await PurchasingRequest.query().where('id', params.id).last()
        purchasingRequest.merge({aktif: 'N'})
        try {
            await purchasingRequest.save()
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed delete Purchasing Requesting,,,'
            }
        }

        return {
            success: true,
            message: 'Success delete Purchasing Requesting,,,'
        }
    }
}

module.exports = new mamPurchasingRequest()