'use strict'

const { performance } = require('perf_hooks')
const moment = require('moment')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")
const db = use('Database')

const DailyCheckp2H = use("App/Models/DailyCheckp2H")
const DailyChecklist = use("App/Models/DailyChecklist")
const DailySmuRecord = use("App/Models/DailySmuRecord")

class TimeSheetApiController {
    async index ({ auth, request, response }){
        var t0 = performance.now()
        const req = request.only(['keyword'])
        var start = moment().startOf('day') // set to 12:00 am today
        var end = moment().endOf('day') // set to 23:59 pm today
        let durasi

        try {
            await auth.authenticator('jwt').getUser()
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }

        await GET_DATA()

        async function GET_DATA(){
            let dailyChecklist
            if(req.keyword){
                dailyChecklist = await DailyChecklist
                    .query()
                    .where('description', 'like', `${req.keyword}`)
                    .fetch()
            }else{
                dailyChecklist = await DailyChecklist
                    .query()
                    .where('tgl', '>=', new Date(start))
                    .andWhere('tgl', '<=', new Date(end))
                    .fetch()
            }

            durasi = await diagnoticTime.durasi(t0)
            response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: dailyChecklist
            })
        }
    }

    async filterDate ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['begin_date', 'end_date'])
        const { begin_date, end_date } = req
        let durasi

        try {
            await auth.authenticator('jwt').getUser()
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }

        await GET_DATA()

        async function GET_DATA(){
            const dailyChecklist = await DailyChecklist
                    .query()
                    .where('tgl', '>=', new Date(begin_date))
                    .andWhere('tgl', '<=', new Date(end_date))
                    .fetch()
            durasi = await diagnoticTime.durasi(t0)
            response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: dailyChecklist.toJSON()
            })
        }
    }

    async create ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.all()
        let durasi
        try {
            await auth.authenticator('jwt').getUser()
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }

        await SAVE_DATA()

        async function SAVE_DATA(){
            let dailySmuRecord
            dailySmuRecord = await DailySmuRecord.query().where('equip_id', req.unit_id).last()
            if(!dailySmuRecord){
                dailySmuRecord = new DailySmuRecord()
                dailySmuRecord.fill({
                    equip_id: req.unit_id, 
                    start_date: new Date(), 
                    start_smu: req.begin_smu,
                    end_date: new Date(), 
                    end_smu: req.begin_smu
                })
                try {
                    await dailySmuRecord.save()
                } catch (error) {
                    console.log(error);
                }
            }

            if(req.begin_smu != dailySmuRecord.end_smu){
                durasi = await diagnoticTime.durasi(t0)
                response.status(403).json({
                    diagnostic: {
                        times: durasi, 
                        error: true,
                        message: 'Data SMU Equipment Unit tidak sesuai dengan data terakhir'
                    },
                    data: dailySmuRecord
                })
            }else{
                const trx = await db.beginTransaction()
                const { user_chk, user_spv, unit_id, dailyfleet_id, tgl, description, begin_smu, p2h } = req
                var tgl_ = new Date(tgl)
                try {
                    const dailyChecklist = new DailyChecklist()
                    dailyChecklist.fill({
                        user_chk, 
                        user_spv, 
                        unit_id, 
                        dailyfleet_id, 
                        description, 
                        begin_smu,
                        tgl: tgl_,
                        approved_at: new Date()
                    })

                    await dailyChecklist.save(trx)

                    let p2hDetails = []
                    for (const item of p2h) {
                        if(item.description != null){
                            console.log(item.description)
                            p2hDetails.push({...item, checklist_id: dailyChecklist.id})
                        }else{
                            throw new Error('ID ::'+item.p2h_id+' Status Uncheck but no description...')
                            
                        }
                    }

                    await DailyCheckp2H.createMany(p2hDetails, trx)
                    await trx.commit()
                    const result = await DailyChecklist.query().last()
                    durasi = await diagnoticTime.durasi(t0)
                    response.status(403).json({
                        diagnostic: {
                            times: durasi, 
                            error: false
                        },
                        data: result
                    })
                } catch (error) {
                    console.log(error)
                    await trx.rollback()
                    durasi = await diagnoticTime.durasi(t0)
                    response.status(403).json({
                        diagnostic: {
                            times: durasi, 
                            error: true,
                            message: error.message
                        },
                        data: []
                    })
                }

            }
        }
    }

    async show ({ auth, params, response }) {
        var t0 = performance.now()
        const { id } = params
        let durasi
        try {
            await auth.authenticator('jwt').getUser()
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }

        await GET_DATA()

        async function GET_DATA(){
            try {
                const dailyChecklist = (
                    await DailyChecklist
                    .query()
                    .with('userCheck')
                    .with('spv')
                    .with('lead')
                    .with('equipment', a => {
                        a.with('daily_smu', whe => whe.limit(10).orderBy('id', 'desc'))
                    })
                    .with('dailyFleet', b => {
                        b.with('pit')
                        b.with('fleet')
                        b.with('activities')
                        b.with('shift')
                    })
                    .where('id', id)
                    .first()
                ).toJSON()
                durasi = await diagnoticTime.durasi(t0)
                response.status(200).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: dailyChecklist
                })
            } catch (error) {
                console.log(error)
                response.status(400).json({
                    diagnostic: {
                        times: durasi, 
                        error: true,
                        message: error.message
                    },
                    data: []
                })
            }
        }
    }
}

module.exports = TimeSheetApiController
