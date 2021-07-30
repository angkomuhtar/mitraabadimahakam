'use strict'

const { performance } = require('perf_hooks')
const moment = require('moment')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")
const TimeSheet = use("App/Controllers/Http/Helpers/TimeSheet")
const db = use('Database')

const MasP2H = use("App/Models/MasP2H")
const DailyFleet = use("App/Models/DailyFleet")
const DailyCheckp2H = use("App/Models/DailyCheckp2H")
const DailyChecklist = use("App/Models/DailyChecklist")
const DailyRefueling = use("App/Models/DailyRefueling")
const P2Hhelpers = use("App/Controllers/Http/Helpers/P2H");

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
                    .with('operator_unit')
                    .with('equipment')
                    .with('p2h')
                    .with('dailyEvent')
                    .where('description', 'like', `${req.keyword}`)
                    .fetch()
            }else{
                dailyChecklist = await DailyChecklist
                    .query()
                    .with('operator_unit')
                    .with('equipment')
                    .with('p2h')
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

    async allTimeSheet ({ auth, request, response }) {
        var t0 = performance.now()
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

        const data = await TimeSheet.ALL(response)
        durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false,
            },
            data: data
        })
    }

    async filterDate ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['date'])
        const { date } = req

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
        };

        const prevDay = moment(date).subtract(1, 'days').format('YYYY-MM-DD');
        const now = moment(date).format('YYYY-MM-DD')
        
        await GET_DATA()

        async function GET_DATA(){
            const dailyChecklist = await DailyChecklist
                    .query()
                    .with('operator_unit')
                    .with('equipment')
                    .with('dailyRefueling', (wh) => {
                        wh.with('user')
                    })
                    .with('dailyFleet', (wh) => {
                        wh.with('shift')
                    })
                    .whereBetween('tgl', [prevDay, now])
                    .orderBy('tgl','desc')
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
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }
        
        const cekDuplicated = 
            await DailyChecklist
                .query()
                .where({
                    operator: req.operator,
                    unit_id: req.unit_id, 
                    dailyfleet_id: req.dailyfleet_id, 
                    tgl: moment(req.tgl).format('YYYY-MM-DD')
            }).first()

        if(cekDuplicated){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(422).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: 'Duplicated Data...'
                },
                data: cekDuplicated
            })
        }else{
            await SAVE_DATA()
        }

        async function SAVE_DATA(){
            let last_smu
            last_smu = await DailyChecklist.query().where('unit_id', req.unit_id).orderBy('id', 'desc').first()
            // console.log(last_smu);
            if(last_smu){
                if(last_smu?.end_smu != req.begin_smu){
                    durasi = await diagnoticTime.durasi(t0)
                    return response.status(403).json({
                        diagnostic: {
                            times: durasi, 
                            error: true,
                            message: 'Data SMU Equipment Unit tidak sesuai dengan data terakhir'
                        },
                        data: last_smu
                    })
                }
            }

            const trx = await db.beginTransaction()
            const { user_chk, user_spv, operator, unit_id, dailyfleet_id, tgl, description, begin_smu, p2h, refueling } = req
            var tgl_ = new Date(tgl)
            try {
                const dailyChecklist = new DailyChecklist()
                dailyChecklist.fill({
                    user_chk, 
                    user_spv, 
                    operator,
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
                    if(item.description === null && item.is_check === 'N'){
                        throw new Error('ID ::'+item.p2h_id+' Status Uncheck but no description...')
                    }else{
                        p2hDetails.push({...item, checklist_id: dailyChecklist.id})
                    }
                }
                await DailyCheckp2H.createMany(p2hDetails, trx)

                const dailyRefueling = new DailyRefueling()
                dailyRefueling.fill({...refueling, timesheet_id: dailyChecklist.id})
                await dailyRefueling.save(trx)

                await trx.commit()
                const result = await DailyChecklist.query().last()
                durasi = await diagnoticTime.durasi(t0)
                response.status(201).json({
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

    async show ({ auth, params, response }) {
        var t0 = performance.now()
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
        } finally {
            const data = await TimeSheet.GET_ID(params)
            const _p2h = await P2Hhelpers.WITH_TIMESHEET_ID(params);
            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false,
                },
                data: data,
                p2h : _p2h
            })
        }
    }

    async update ({ auth, params, request, response }) {
        var t0 = performance.now()
        const { id } = params
        const req = request.only(['user_chk', 'user_spv', 'operator', 'unit_id', 'dailyfleet_id', 'tgl', 'description', 'begin_smu', 'end_smu', 'p2h', 'event', 'refueling'])
        let durasi
        console.log(req);
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

        const cekDailyFleet = await DailyFleet.find(req.dailyfleet_id)
        if(!cekDailyFleet){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(412).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: 'DailyFleet not found...'
                },
                data: {}
            })
        }

        const dailyChecklist = await DailyChecklist.find(id)
        if(!dailyChecklist){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(412).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: 'ID Time Sheet not found...'
                },
                data: {}
            })
        }

        // if(!req.refueling){
        //     durasi = await diagnoticTime.durasi(t0)
        //     return response.status(412).json({
        //         diagnostic: {
        //             times: durasi, 
        //             error: true,
        //             message: 'Data Pengisian Bahan Bakar tdk valid...'
        //         },
        //         data: {}
        //     })
        // }

        // if(!req.refueling.topup){
        //     durasi = await diagnoticTime.durasi(t0)
        //     return response.status(412).json({
        //         diagnostic: {
        //             times: durasi, 
        //             error: true,
        //             message: 'Jumlah Topup Fuel tdk valid...'
        //         },
        //         data: {}
        //     })
        // }

        if(req.refueling.smu === '' || req.refueling.topup < 0){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(412).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: 'Input SMU Refuel Unit tdk valid...'
                },
                data: {}
            })
        }

        try {
            const data = await TimeSheet.UPDATE(params, req)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: data
            })
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: false,
                    message: error
                },
                data: []
            })
        }
    }
}

module.exports = TimeSheetApiController
