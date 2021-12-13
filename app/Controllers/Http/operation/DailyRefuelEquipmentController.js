'use strict'

const RefuelUnitHelpers = use("App/Controllers/Http/Helpers/Fuel")
const MasEquipment = use("App/Models/MasEquipment")
const dailyRefueling = use("App/Models/DailyRefueling")
const Helpers = use('Helpers')
const moment = require('moment')
const excelToJson = require('convert-excel-to-json');

class DailyRefuelEquipmentController {
    async index ({ auth, view }) {
        return view.render('operation.daily-refuel-unit.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        const data = await RefuelUnitHelpers.LIST_REFUEL_UNIT(req)
        // return data
        return view.render('operation.daily-refuel-unit.list', {list: data.toJSON()})
    }

    async create ( { auth, view } ) {
        const usr = await auth.getUser()
        return view.render('operation.daily-refuel-unit.create')
    }

    async uploadFile ( { auth, request } ) {
        const validateFile = {
            types: ['xls', 'xlsx'],
            size: '2mb',
            types: 'application'
        }
        const reqFile = request.file("refuel_xls", validateFile)
        console.log(reqFile);

        let aliasName
        if(reqFile){
            aliasName = `refuel-unit-${moment().format('DDMMYYHHmmss')}.${reqFile.extname}`

            await reqFile.move(Helpers.publicPath(`/upload/`), {
                name: aliasName,
                overwrite: true,
            })
    
            if (!reqFile.moved()) {
                return reqFile.error()
            }

            var pathData = Helpers.publicPath(`/upload/`)

            const convertJSON = excelToJson({
                sourceFile: `${pathData}${aliasName}`,
                header:{
                    rows: 4
                }
            });

            var arr = Object.keys(convertJSON).map(function (key) {    
                return key
            })

            return {
                title: arr,
                data: convertJSON
            }

        }else{
            return {
                title: ['No File Upload'],
                data: []
            }
        }
    }

    async store ({ auth, request }) {
        const usr = await auth.getUser()
        const req = request.only(['tgl', 'site_id', 'fuel_truck', 'shift_id', 'fm_awal', 'fm_akhir', 'sheet', 'dataJson'])
        let xlsJSON = JSON.parse(req.dataJson)

        xlsJSON = Object.keys(xlsJSON).map(key => {
            return {
                sheet: key,
                data: xlsJSON[key]
            }
        })

        const [data] = xlsJSON.filter(sht => sht.sheet === req.sheet)

        const initData = data.data.filter( u => u.C)

        let arrData = []

        for (const OBJ of initData) {
            const Unit = await MasEquipment.query().where('kode', OBJ.C).last()
            let tmp = {}
            if(Unit){
                tmp = {...tmp, unit_id: Unit.kode}
            }else{
                tmp = {...tmp, unit_id: null}
            }
            arrData.push(tmp)
        }
        console.log(arrData);

        let parsingShift = initData.map( EL => {
            let dayShift = { fuel_at: EL.D || null }
            let nightShift = { fuel_at: EL.H || null }
            return {
                kode: EL.C,
                details: [

                ]
                // shift_siang: EL.D ? 1 : null,
                // shift_malam: EL.H ? 2 : null,
                // hm_siang: EL.E ? EL.E : null,
                // hm_malam: EL.I ? EL.I : null,
                // topup_siang: EL.F ? EL.F : null,
                // topup_malam: EL.J ? EL.J : null,
                // fuelBy_malam: EL.G ? EL.G : null,
                // fuelBy_siang: EL.G ? EL.G : null,

            }
        })

        return parsingShift
        
        // const validateFile = {
        //     types: ['xls', 'xlsx'],
        //     size: '2mb',
        //     types: 'application'
        // }

        // const uploadData = request.file("refuel_xls", validateFile)

        // let aliasName
        
        // if(uploadData){
        //     aliasName = `refuel-unit-${moment().format('DDMMYYHHmmss')}.${uploadData.extname}`
        //     await uploadData.move(Helpers.publicPath(`/upload/`), {
        //         name: aliasName,
        //         overwrite: true,
        //     })
    
        //     if (!uploadData.moved()) {
        //         return uploadData.error()
        //     }


        //     var pathData = Helpers.publicPath(`/upload/`)

        //     const convertJSON = excelToJson({
        //         sourceFile: `${pathData}${aliasName}`,
        //         header:{
        //             rows: 1
        //         },
        //         sheets: ['FORM']
        //     });

        //     const filterData = convertJSON.FORM.filter(cell => cell.B != '#N/A')

        //     console.log(convertJSON);

        //     const result = filterData.map(cell => {
        //         var date = new Date(req.tgl+' '+moment(cell.F).format('HH:mm'))
        //         return {
        //             equip_id: cell.B,
        //             site_id: req.site_id,
        //             shift_id: req.shift_id,
        //             fuel_truck: req.fuel_truck,
        //             operator: cell.I != '#N/A' ? cell.I : null,
        //             smu: cell.G ? parseFloat(cell.G) : 0,
        //             topup: cell.H ? parseFloat(cell.H) : 0,
        //             description: cell.K ? cell.K : null,
        //             fm_awal: parseFloat(req.fm_awal),
        //             fm_akhir: parseFloat(req.fm_akhir),
        //             fueling_at: moment(date).format('YYYY-MM-DD HH:mm'),
        //             user_id: usr.id
        //         }
        //     })

        //     let resp = {
        //         success: false,
        //         message: 'data failed success'
        //     }

        //     for (const data of result) {
        //         const daily_refueling = await dailyRefueling
        //         .query()
        //         .where(w => {
        //             w.where('site_id', data.site_id)
        //             w.where('equip_id', data.equip_id)
        //             w.where('fueling_at', '>=', moment(data.fueling_at).format('YYYY-MM-DD') + ' 00:00:01')
        //             w.where('fueling_at', '<=', moment(data.fueling_at).format('YYYY-MM-DD') + ' 23:59:59')
        //         }).last()

        //         if(daily_refueling){
        //             var params = {id: daily_refueling.id}
        //             await RefuelUnitHelpers.UPDATE_REFUEL_UNIT(params, data)
        //             resp = {...resp, success: true, message: 'data update success'}
        //         }else{
        //             const add = await RefuelUnitHelpers.POST_REFUEL_UNIT(data)
        //             console.log(add)
        //             resp = {...resp, success: true, message: 'data save success'}
        //         }
        //     }

        //     return resp

        // }


    }
}

module.exports = DailyRefuelEquipmentController
