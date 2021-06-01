'use strict'
const { performance } = require('perf_hooks')
const moment = require('moment')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const MasShift = use("App/Models/MasShift")
const Equipment = use("App/Models/MasEquipment")
const DailyFleetEquip = use("App/Models/DailyFleetEquip")

class EquipmentApiController {
    async index ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['keyword'])
        try {
            await auth.authenticator('jwt').getUser()
        } catch (error) {
            console.log(error)
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }

        let equipment
        if(req.keyword){
            equipment = 
                await Equipment
                    .query()
                    .where(word => {
                        word.where('kode', 'like', `%${req.keyword}%`)
                        word.orWhere('brand', 'like', `%${req.keyword}%`)
                        word.orWhere('tipe', 'like', `%${req.keyword}%`)
                        word.orWhere('unit_model', 'like', `%${req.keyword}%`)
                    })
                    .andWhere({aktif: 'Y'})
                    .fetch()
        }else{
            equipment = 
                await Equipment.query().where({aktif: 'Y'}).fetch()
        }

        let durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: equipment
        })
    }

    async availableForFleet ({auth, request, response}) {
        var t0 = performance.now()
        const req = request.only(['date', 'shift_id'])
        try {
            await auth.authenticator('jwt').getUser()
        } catch (error) {
            console.log(error)
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: []
            })
        }
        
        const shiftClock = (await MasShift.query().where({id: req.shift_id, status: 'Y'}).first()).toJSON()
        const tglx = new Date(`${req.date} ${shiftClock.start_shift}`)
        const begin = moment(tglx).format('YYYY-MM-DD HH:mm')
        const end = moment(tglx).add(12, 'hours').format('YYYY-MM-DD HH:mm')
        
        let data = []
        let equipment = (await Equipment.query().where({aktif: 'Y'}).fetch()).toJSON()
        for (const item of equipment) {
            const equip = await DailyFleetEquip.query().whereBetween('datetime', [begin, end]).andWhere('equip_id', item.id).first()
            if(equip){
                data.push({...item, on_fleet: true})
            }else{
                data.push({...item, on_fleet: false})
            }
        }

        let durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: data
        })
    }
}

module.exports = EquipmentApiController
