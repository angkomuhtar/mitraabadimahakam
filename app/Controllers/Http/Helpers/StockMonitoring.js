'use strict'
const db = use('Database')
const _ = require('underscore')
const moment = require('moment')
const Barang = use("App/Models/MasBarang")
const MamBarangIn = use("App/Models/MamBarangIn")
const MamBarangOut = use("App/Models/MamBarangOut")
const MamBarangStok = use("App/Models/MamBarangStok")
// const PurchasingOrder = use("App/Models/MamPurchasingOrder")
// const PurchasingOrderItem = use("App/Models/MamPurchasingOrderItem")
// const PurchasingRequest = use("App/Models/MamPurchasingRequest")
// const PurchasingRequestItem = use("App/Models/MamPurchasingRequestItem")


class stockMonitoring {
    async LIST (req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const stok = await MamBarangStok.query()
        .with('barang')
        .with('gudang')
        .where( w  => {
            if(req.cabang_id){
                w.where('cabang_id', req.cabang_id)
            }
            if(req.barang_id){
                w.where('barang_id', req.barang_id)
            }
        }).paginate(halaman, limit)

        let barang = stok.toJSON()

        return barang
    }

    async HISTORY_IN (params, req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const data = (
            await MamBarangIn.query()
            .with('purchasingRequest')
            .with('gudang')
            .with('barang')
            .with('author')
            .where( w => {
                w.where('barang_id', params.id)
                w.where('gudang_id', params.gudang_id)
            }).paginate(halaman, limit)
        ).toJSON()

        return data
    }

    async HISTORY_OUT (params, req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const data = (
            await MamBarangOut.query()
            .with('materialRequest')
            .with('gudang')
            .with('barang')
            .with('author')
            .where( w => {
                w.where('barang_id', params.id)
                w.where('gudang_id', params.gudang_id)
            }).paginate(halaman, limit)
        ).toJSON()

        return data
    }
    
    // async SHOW (params) {
    //     const purchasingOrder = await PurchasingOrder.query()
    //     .with('items', i => {
    //         i.with('barang')
    //         i.with('equipment')
    //     })
    //     .where('id', params.id).last()
    //     return purchasingRequest.toJSON()
    // }

    async POST (req, user) {

        const trx = await db.beginTransaction()

        if(req.type === 'in'){
            for (const obj of req.items) {
                const mamBarangIn = new MamBarangIn()
                mamBarangIn.fill({
                    request_id: null,
                    transfer_id: null,
                    date: req.date,
                    equipment_reff: obj.equipment_reff || null,
                    gudang_id: req.gudang_id,
                    barang_id: obj.barang_id,
                    qty_in: obj.qty,
                    narasi: req.narasi,
                    created_by: user.id
                })
                try {
                    await mamBarangIn.save(trx)
                } catch (error) {
                    console.log(error);
                    await trx.rollback()
                    return {
                        success: false,
                        message: 'Failed save Items Masuk,,,'
                    }
                }

                let stock = await MamBarangStok.query().where( w => {
                    w.where('gudang_id', req.gudang_id)
                    w.where('barang_id', obj.barang_id)
                }).last()

                try {
                    if(stock){
                        stock.merge({ 
                            stok: parseFloat(stock.stok) + parseFloat(obj.qty),
                            remark: req.narasi
                        })
                    }else{
                        stock = new MamBarangStok()
                        stock.fill({ 
                            gudang_id: req.gudang_id,
                            barang_id: obj.barang_id,
                            stok: parseFloat(obj.qty),
                            remark: req.narasi
                        })
                    }
                    await stock.save(trx)
                } catch (error) {
                    console.log(error);
                    await trx.rollback()
                    return {
                        success: false,
                        message: 'Failed save Stock Masuk,,,'
                    }
                }
            }
        }else{
            for (const obj of req.items) {
                const mamBarangOut = new MamBarangOut()
                mamBarangOut.fill({
                    request_id: null,
                    transfer_id: null,
                    date: req.date,
                    gudang_id: req.gudang_id,
                    equipment_reff: obj.equipment_reff || null,
                    barang_id: obj.barang_id,
                    qty_out: obj.qty,
                    narasi: req.narasi,
                    created_by: user.id
                })
                try {
                    await mamBarangOut.save(trx)
                } catch (error) {
                    console.log(error);
                    await trx.rollback()
                    return {
                        success: false,
                        message: 'Failed save Items Masuk,,,'
                    }
                }

                let stock = await MamBarangStok.query().where( w => {
                    w.where('gudang_id', req.gudang_id)
                    w.where('barang_id', obj.barang_id)
                }).last()

                try {
                    if(stock){
                        stock.merge({ 
                            stok: parseFloat(stock.stok) - parseFloat(obj.qty),
                            remark: req.narasi
                        })
                    }else{
                        stock = new MamBarangStok()
                        stock.fill({ 
                            gudang_id: req.gudang_id,
                            barang_id: obj.barang_id,
                            stok: parseFloat(obj.qty) * (-1),
                            remark: req.narasi
                        })
                    }
                    await stock.save(trx)
                } catch (error) {
                    console.log(error);
                    await trx.rollback()
                    return {
                        success: false,
                        message: 'Failed save Stock Masuk,,,'
                    }
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

module.exports = new stockMonitoring()