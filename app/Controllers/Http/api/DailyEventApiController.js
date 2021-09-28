'use strict'

const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")
const EventTimeSheetHelpers = use("App/Controllers/Http/Helpers/DailyEvent")

class DailyEventApiController {
    async index ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['keyword', 'page'])
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

        try {
            const data = await EventTimeSheetHelpers.ALL(req)
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
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }
    }

    // show data today and previous day
    // async filterByDate ({ auth, request, response }) {
    //     var t0 = performance.now()
    //     const { date } = request.only(['date'])
    //     let durasi
    //     try {
    //         await auth.authenticator('jwt').getUser()
    //     } catch (error) {
    //         console.log(error)
    //         durasi = await diagnoticTime.durasi(t0)
    //         return response.status(403).json({
    //             diagnostic: {
    //                 times: durasi, 
    //                 error: true,
    //                 message: error.message
    //             },
    //             data: {}
    //         })
    //     }

    //     const now = moment(date).format('YYYY-MM-DD');
    //     const prevDay = moment(date).subtract(1, 'days').format('YYYY-MM-DD');

    //     try {
    //         const data = await EventTimeSheet.query()
    //         .with('timesheet', wh => {
    //             wh.whereBetween('tgl', [prevDay, now])
    //             wh.orderBy('tgl', 'desc')
    //         })
    //         .with('event')
    //         .with('equipment')
    //         .with('createdby')
    //         .fetch()

    //         durasi = await diagnoticTime.durasi(t0)
    //         return response.status(201).json({
    //             diagnostic: {
    //                 times: durasi, 
    //                 error: false
    //             },
    //             data: data
    //         })
    //     } catch (error) {
    //         console.log(error)
    //         durasi = await diagnoticTime.durasi(t0)
    //         return response.status(403).json({
    //             diagnostic: {
    //                 times: durasi, 
    //                 error: true,
    //                 message: error.message
    //             },
    //             data: {}
    //         })
    //     }
    // }

    async timesheetID ({ auth, params, request, response }) {
        var t0 = performance.now()
        const req = request.only(['keyword', 'page'])
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

        try {
            const data = await EventTimeSheetHelpers.TIMESHEET_ID(params, req)
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
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }
    }

    async equipmentID ({ auth, params, request, response }) {
        var t0 = performance.now()
        const req = request.only(['keyword', 'page'])
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

        try {
            const data = await EventTimeSheetHelpers.EQUIPMENT_ID(params, req)
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
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }
    }

    async store ({ auth, params, request, response }) {
        var t0 = performance.now()
        const { id } = params
        const req = request.only([
            'timesheet_id', 
            'event_id', 
            'user_id',
            'equip_id',
            'description',
            'start_at',
            'end_at'
        ])
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

        try {
            const data = await EventTimeSheetHelpers.POST(params, req)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: data
            })
        } catch (error) {
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: []
            })
        }
    }

    async saveWithoutTimeSheet ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only([
            'timesheet_id', 
            'event_id', 
            'user_id',
            'equip_id',
            'description',
            'start_at',
            'end_at'
        ])
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

        try {
            const data = await EventTimeSheetHelpers.POST_WITHOUT_TIMESHEET(req)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: data
            })
        } catch (error) {
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: []
            })
        }
    }

    async destroy ({ auth, params, response }) {
        var t0 = performance.now()
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

        try {
            const data = await EventTimeSheetHelpers.DELETE(params)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi, 
                    error: false,
                    message: 'Delete data success...'
                },
                data: data
            })
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
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


module.exports = DailyEventApiController
