'use strict'

const fs = require('fs');
const db = use('Database')
const moment = require("moment")
const MasSeam = use("App/Models/MasSeam")
const DailyFleet = use("App/Models/DailyFleet")
const DailyFleetEquip = use("App/Models/DailyFleetEquip")
const UnitSubcont = use("App/Models/MasEquipmentSubcont")
const DailyRitaseCoal = use("App/Models/DailyRitaseCoal")
const DailyRitaseCoalDetail = use("App/Models/DailyRitaseCoalDetail")
const DailyRitaseCoalHelpers = use("App/Controllers/Http/Helpers/DailyRitaseCoal")
const DailyRitaseCoalDeatilHelpers = use("App/Controllers/Http/Helpers/DailyRitaseCoalDetail")
const Helpers = use('Helpers')
const excelToJson = require('convert-excel-to-json');

let aliasName


class DailyRitaseCoalController {
    async index ({ view }) {
        return view.render('operation.daily-ritase-coal.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        
        let data = []
        try {
            data = await DailyRitaseCoalDeatilHelpers.ALL(req)
        } catch (error) {
            console.log(error)
        }
        return view.render('operation.daily-ritase-coal.list', {
            limit: req.limit || 100,
            list: data.toJSON()
        })
    }

    async create ({ view }) {
        return view.render('operation.daily-ritase-coal.create')
    }

    async fileValidate ({auth, request}) {
        try {
            await auth.getUser()
        } catch (error) {
            return {
                success: false,
                message: 'you not authorized....'
            }
        }

        
        const validateFile = {
            types: ['xls', 'xlsx'],
            size: '2mb',
            types: 'application'
        }
        
        const uploadData = request.file("uploadfiles", validateFile)

        

        if(uploadData){
            aliasName = `upload-jetty-${moment().format('DDMMYYHHmmss')}.${uploadData.extname}`

            await uploadData.move(Helpers.publicPath(`/upload/`), {
                name: aliasName,
                overwrite: true,
            })
    
            if (!uploadData.moved()) {
                return uploadData.error()
            }

            var pathData = Helpers.publicPath(`/upload/`)

            const convertJSON = excelToJson({
                sourceFile: `${pathData}${aliasName}`,
                header:{
                    rows: 3
                }
            });

            var arr = Object.keys(convertJSON).map(function (key) {    
                return key
            })

            return {
                title: arr,
                data: convertJSON
            }

        }
    }

    async store ({ auth, request }) {
        let usr
        let exca_id
        let dailyFleet
        let dailyRitaseCoal
        const req = request.all()
        try {
            usr = await auth.getUser()
        } catch (error) {
            return {
                success: false,
                message: 'you not authorized....'
            }
        }

        
        const data = JSON.parse(req.jsonData)

        let parsing = Object.keys(data).map(function (key) {
            return {
                nm_sheet: key, 
                details: data[key]
            }
        })

        /* Generate Filter Object */
        const [selectSheet] = parsing.filter(function(obj){ return obj.nm_sheet === req.nm_sheet })

        let genData = selectSheet.details.filter(
            item => item.O > 0 && moment(item.F).add(1, 'minutes').format('YYYY-MM-DD') === req.date)
            .map(item => {
                if(item.B){
                    var date = moment(item.F).add(1, 'minutes').format('YYYY-MM-DD')
                    var parsingSeam = (item.L).split('.').length > 1 ? (item.L).split('.')[1] : ((item.L).split('.')[0]).replace(/\s/g, '')
                    return {
                        checker_jt: usr.id,
                        shift_id: item.E,
                        date: date,
                        checkout_pit: date + ' ' + '00:00',
                        checkin_jt: date + ' ' + moment(item.H).add(3, 'minutes').format('HH:mm'),
                        checkout_jt: date + ' ' + moment(item.I).add(3, 'minutes').format('HH:mm'),
                        no_kupon: item.J,
                        ticket: item.Q,
                        seam_id: parsingSeam,
                        subcondt_id: item.K,
                        w_gross: item.M * 1000,
                        w_tare: item.N * 1000,
                        w_netto: item.O * 1000,
                        block: parseInt((item.P).replace('BL.', ''))
                    }
                }
            })
       

        for (const obj of genData) {
            dailyFleet = await DailyFleet.query().where({
                pit_id: req.pit_id, 
                fleet_id: req.fleet_id, 
                shift_id: obj.shift_id, 
                date: req.date,
                activity_id: 8
            }).last()


            if(!dailyFleet){
                return {
                    data: {
                        pit_id: req.pit_id, 
                        fleet_id: req.fleet_id, 
                        shift_id: obj.shift_id, 
                        date: req.date,
                        activity_id: 8
                    },
                    success: false,
                    message: 'Daily Fleet utk hauling coal tidak ditemukan...'
                }
            }
        }


        /* Validate Undefined UNIT DT  & Daily Ritase Coal */
        for (const obj of genData) {
            const unitDT = await UnitSubcont.query().where('kode', 'like', `${obj.subcondt_id}`).last()
            if(!unitDT){
                return {
                    success: false,
                    message: 'Unit DT ' + obj.subcondt_id + ' tidak di temukan...'
                }
            }

        }

        /* Grouping Object By Shift */
        let groupShift = genData.reduce((r, a) => {
            r[a.shift_id] = [...r[a.shift_id] || [], a];
            return r;
        }, {});

        /* Generate Object By Block */
        function GROUPING_BLOCK(data){
            const grp = data.reduce((r, a) => {
                r[a.block] = [...r[a.block] || [], a];
                return r;
            }, {});
            return Object.keys(grp).map(function (key) {
                return {
                    block: key, 
                    details: grp[key]
                }
            })
        }

        /* Generate Valid Object */
        let parsingShift = Object.keys(groupShift).map(function (key) {
            var shiftDetails = groupShift[key]
            return {
                shift_id: key, 
                data: GROUPING_BLOCK(shiftDetails)
            }
        })

        try {
            for (const obj of parsingShift) {
            
                var shift = obj.shift_id
                
    
                for (const item of obj.data) {
    
                    /* Cari ID Unit Excavator */
                    const unitExcavator = (await DailyFleetEquip.query().with('equipment').where('dailyfleet_id', dailyFleet.id).fetch()).toJSON()
    
                    const [excavator] = unitExcavator.filter(obj => obj.equipment.tipe === 'excavator')
    
                    exca_id = excavator.equipment.id
    
                    dailyRitaseCoal = await DailyRitaseCoal
                        .query()
                        .where(w => {
                            w.where('shift_id', shift)
                            w.where('block', item.block)
                            w.where('date', '>=', req.date + ' ' + '00:00:01')
                            w.where('date', '<=', req.date + ' ' + '23:59:59')
                        }).last()
    
    
                    if(!dailyRitaseCoal){
                        dailyRitaseCoal = new DailyRitaseCoal()
                        dailyRitaseCoal.fill({
                            distance: 23,
                            dailyfleet_id: dailyFleet.id,
                            exca_id: exca_id,
                            checker_id: usr.id,
                            shift_id: shift,
                            block: item.block,
                            date: req.date + ' ' + '00:00:01'
                        })
                        try {
                            await dailyRitaseCoal.save()
                        } catch (error) {
                            console.log(error);
                            return {
                                success: false,
                                message: 'Save data daily ritase coal failed....'
                            }
                        }
                    }
    
                    for (const val of item.details) {
                        const unitDT = (
                            await UnitSubcont
                            .query()
                            .where('kode', 'like', `${val.subcondt_id}`)
                            .last()
                        ).toJSON()
    
                        let seam
                        try {
                            seam = (
                                await MasSeam
                                .query()
                                .where( w => {
                                    w.where('kode', val.seam_id)
                                    w.where('pit_id', req.pit_id)
                                }).last()
                            ).toJSON()
    
                        } catch (error) {
                            console.log(error);
                            return {
                                success: false,
                                message: 'Kode Seam '+val.seam_id+' tdk ditemukan....'
                            }
                        }
    
                        const formatKupon = '0'.repeat( 7 - `${val.no_kupon}`.length) + val.no_kupon
    
                        const detailUpload = {
                            ritasecoal_id: dailyRitaseCoal.id,
                            kupon: formatKupon,
                            ticket: val.ticket,
                            seam_id: seam.id,
                            subcondt_id: unitDT.id,
                            checkout_pit: val.checkout_pit,
                            checkin_jt: val.checkin_jt,
                            checkout_jt: val.checkout_jt,
                            w_gross: val.w_gross,
                            w_tare: val.w_tare,
                            w_netto: val.w_netto,
                            checker_jt: usr.id
                        }
    
                        let dailyRitaseCoalDetail
    
                        dailyRitaseCoalDetail = await DailyRitaseCoalDetail
                            .query()
                            .where( w => {
                                w.where('ritasecoal_id', dailyRitaseCoal.id)
                                w.where('ticket', val.ticket)
                                w.where('kupon', formatKupon)
                            })
                            .first()
    
                        if(!dailyRitaseCoalDetail){
    
                            dailyRitaseCoalDetail = new DailyRitaseCoalDetail()
                            dailyRitaseCoalDetail.fill({
                                ...detailUpload,
                                keterangan: 'Upload file manual....'
                            })
                            await dailyRitaseCoalDetail.save()
                        }else{
    
                            dailyRitaseCoalDetail.merge({
                                ...detailUpload,
                                keterangan: 'ReUpload file manual....'
                            })
                            await dailyRitaseCoalDetail.save()
                        }
                    }
                }
            }
            return {
                success: true,
                data: genData,
                message: 'Upload data ritase coal success....'
            }
        } catch (error) {
            return {
                success: false,
                data: error,
                message: 'Upload data ritase coal success....'
            }
        }
        
    }

    async show ({ params, view }) {
        console.log(params);
        let data = {}
        try {
            data = await DailyRitaseCoalDeatilHelpers.GET_ID(params)
            console.log(data.toJSON());
        } catch (error) {
            console.log(error)
        }
        return view.render('operation.daily-ritase-coal.show', {data: data.toJSON()})
    }

    async view ({ params, view }) {
        console.log(params);
        let data = {}
        try {
            data = await DailyRitaseCoalDeatilHelpers.GET_ID(params)
            console.log(data.toJSON());
        } catch (error) {
            console.log(error)
        }
        return view.render('operation.daily-ritase-coal.view', {data: data.toJSON()})
    }

    async update ({ auth, params, request }) {
        const req = request.only([
            'checkin_jt', 
            'checkout_jt', 
            'ticket', 
            'stockpile', 
            'coal_tipe',
            'w_gross', 
            'w_tare', 
            'w_netto', 
            'keterangan'
        ])
        const usr = await auth.getUser()
        req.checker_jt = usr.id
        req.stockpile = (req.stockpile).toUpperCase()
        try {
            const data = await DailyRitaseCoalDeatilHelpers.UPDATE(params, req)
            // console.log(data.toJSON());
            return {
                success: true,
                message: 'Ritase Coal success akumulated...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    }
}

module.exports = DailyRitaseCoalController
