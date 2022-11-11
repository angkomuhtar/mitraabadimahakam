'use strict'
const db = use('Database')
const { async } = require('crypto-random-string')
const moment = require('moment')
const Barang = use("App/Models/MasBarang")
const MasDepartment = use("App/Models/MasDepartment")
const LogMaterialRequest = use("App/Models/LogMaterialRequest")
const LogMaterialRequestItem = use("App/Models/LogMaterialRequestItem")


class mamMaterialRequest {
    async LIST (req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const materialRequest = await LogMaterialRequest.query()
        .with('site')
        .with('pit')
        .with('author')
        .with('approved')
        .with('department')
        .with('items', i => i.where('aktif', 'Y'))
        .where( w  => {
            if (req.kode) {
                w.where('kode', 'like', `%${req.kode}%`)
            }
            if (req.department_id) {
                w.where('department_id', req.department_id)
            }
            if (req.pit_id) {
                w.where('priority', req.pit_id)
            }
            if (req.status) {
                w.where('status', req.status)
            }
            if (req.begin_date && req.end_date) {
                w.where('date', '>=', req.begin_date)
                w.where('date', '<=', req.end_date)
            }
        }).orderBy([{column: 'date', order: 'desc'}, {column: 'kode', order: 'asc'}]).paginate(halaman, limit)

        let data = materialRequest.toJSON()
        return data
    }
    
    async SHOW (params) {
        const materialRequest = (
            await LogMaterialRequest.query()
            .with('site')
            .with('pit')
            .with('author')
            .with('approved')
            .with('department')
            .with('items', i => {
                i.with('barang')
                i.with('equipment')
                i.where('aktif', 'Y')
            })
            .where('id', params.id).last()
        ).toJSON()
        return materialRequest
    }

    async POST (req, user) {

        const trx = await db.beginTransaction()
        
        let materialRequest = new LogMaterialRequest()

        try {
            materialRequest.fill({
                site_id: req.site_id || null,
                pit_id: req.pit_id || null,
                department_id: req.department_id,
                priority: req.priority,
                narasi: req.narasi || '',
                request_by: user.id,
                date: new Date(),
                kode: req.kode
            })
            await materialRequest.save(trx)
        } catch (error) {
            console.log(error);
            await trx.rollback()
            return {
                success: false,
                message: 'Failed save Material Request,,,'
            }
        }

        for (const obj of req.items) {

            let materialRequestItem = new LogMaterialRequestItem()
            try {
                materialRequestItem.fill({
                    material_req_id: materialRequest.id,
                    barang_id: obj.barang_id,
                    qty: obj.qty,
                    qty_accept: obj.qty,
                    narasi: '',
                    equipment_reff: obj.equipment_reff || null
                })
                await materialRequestItem.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed save Material Request Items,,,'
                }
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success save Material Request,,,'
        }
    }

    async CHECK (params, user) {
        const materialRequest = await LogMaterialRequest.query().where('id', params.id).last()

        try {
            materialRequest.merge({
                approved_at: new Date(),
                status: 'ready',
                approved_by: user.id
            })
            await materialRequest.save()
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: error
            }
        }

        return {
            success: true,
            message: 'Data success approved...'
        }
    }

    async UPDATE (req, params, user) {
        const trx = await db.beginTransaction()
        const materialRequest = await LogMaterialRequest.query().where('id', params.id).last()

        try {
            materialRequest.merge({
                site_id: req.site_id || null,
                pit_id: req.pit_id || null,
                department_id: req.department_id,
                narasi: req.narasi || '',
                priority: req.priority,
                request_by: user.id,
                date: new Date()
            })
            await materialRequest.save(trx)
        } catch (error) {
            console.log(error);
            await trx.rollback()
            return {
                success: false,
                message: error
            }
        }

        /** UPDATE INACTIVE STATUS ITEM **/
        const itemsMaterial = (await LogMaterialRequestItem.query().where('material_req_id', params.id).fetch()).toJSON()
        for (const val of itemsMaterial) {
            const itemInactive = await LogMaterialRequestItem.query().where('id', val.id).last()
            try {
                itemInactive.merge({
                    aktif: 'N',
                    narasi: 'item diupdate oleh user'
                })
                await itemInactive.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: error
                }
            }
        }

        /** REINSERT MATERIAL REQUEST ITEM **/
        for (const obj of req.items) {
            const materialRequestItem = new LogMaterialRequestItem()
            try {
                materialRequestItem.fill({
                    material_req_id: params.id,
                    barang_id: obj.barang_id,
                    qty: obj.qty,
                    qty_accept: obj.qty,
                    narasi: '',
                    equipment_reff: obj.equipment_reff || null
                })
                await materialRequestItem.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed save Material Request Items,,,'
                }
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success save Material Request,,,'
        }
    }
}

module.exports = new mamMaterialRequest()