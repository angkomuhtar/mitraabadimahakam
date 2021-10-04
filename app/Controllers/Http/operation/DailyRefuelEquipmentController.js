'use strict'

const RefuelUnitHelpers = use("App/Controllers/Http/Helpers/Fuel")
const dailyRefueling = use("App/Models/DailyRefueling")
// const excelToJson = use("convert-excel-to-json")
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
        // console.log(data.toJSON());
        return view.render('operation.daily-refuel-unit.list', {list: data.toJSON()})
    }

    async create ( { auth, view } ) {
        const usr = await auth.getUser()
        return view.render('operation.daily-refuel-unit.create')
    }

    async store ({ request }) {
        const req = request.only(['tgl', 'site_id', 'fuel_truck', 'shift_id', 'fm_awal', 'fm_akhir'])
        const host = request.headers().origin
        const validateFile = {
            types: ['xls', 'xlsx'],
            size: '2mb',
            types: 'application'
        }

        console.log(req);
        const uploadData = request.file("refuel_xls", validateFile)
        console.log(uploadData.extname);

        let aliasName
        
        if(uploadData){
            aliasName = `refuel-unit-${moment().format('DDMMYYHHmmss')}.${uploadData.extname}`
            // let uriImages = host + '/upload/'+aliasName
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
                    rows: 1
                },
                sheets: ['FORM']
            });

            const filterData = convertJSON.FORM.filter(cell => cell.B != '#N/A')

            const result = filterData.map(cell => {
                var date = new Date(req.tgl+' '+moment(cell.F).format('HH:mm'))
                return {
                    equip_id: cell.B,
                    site_id: req.site_id,
                    shift_id: req.shift_id,
                    fuel_truck: req.fuel_truck,
                    operator: cell.I != '#N/A' ? cell.I : null,
                    smu: cell.G != '#N/A' ? parseFloat(cell.G) : 0,
                    topup: cell.H ? parseFloat(cell.H) : 0,
                    description: cell.K ? cell.K : null,
                    fm_awal: parseFloat(req.fm_awal),
                    fm_akhir: parseFloat(req.fm_akhir),
                    fueling_at: moment(date).format('YYYY-MM-DD HH:mm')
                }
            })
            // console.log('DATA EXCEL ::::', result);

            let resp = {
                success: false,
                message: 'data failed success'
            }

            for (const data of result) {
                const daily_refueling = await dailyRefueling
                .query()
                .where(w => {
                    w.where('site_id', data.site_id)
                    w.where('equip_id', data.equip_id)
                }).last()

                if(daily_refueling){
                    var params = {id: daily_refueling.id}
                    await RefuelUnitHelpers.UPDATE_REFUEL_UNIT(params, data)
                    resp = {...resp, success: true, message: 'data update success'}
                }else{
                    const add = await RefuelUnitHelpers.POST_REFUEL_UNIT(data)
                    console.log(add)
                    resp = {...resp, success: true, message: 'data save success'}
                }
            }

            return resp

        }


    }
}

module.exports = DailyRefuelEquipmentController
