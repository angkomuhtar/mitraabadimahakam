'use strict'

const db = use('Database')
const moment = use('moment')
const Helpers = use('Helpers')
const _ = require("underscore")
const DailyRitase = use("App/Models/DailyRitase")
const TimeSheet = use("App/Models/DailyChecklist")
const excelToJson = require('convert-excel-to-json');
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")
const DailyRitaseHelpers = use("App/Controllers/Http/Helpers/DailyRitase")

class DailyRitaseController {
    async index ({ view }) {
        return view.render('operation.daily-ritase-ob.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        try {
            const dailyRitase = (
                await DailyRitaseHelpers.ALL(req)
            ).toJSON()
            return view.render('operation.daily-ritase-ob.list', {
                list: dailyRitase,
                limit: req.limit || 25
            })
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    }

    async create ({ view, auth }) {
        try {
            await auth.getUser()
            return view.render('operation.daily-ritase-ob.create')
        } catch (error) {
            console.log(error);
        }
    }

    async store ({ request, auth }) {
        const req = request.all()
        try {
            await auth.getUser()
        } catch (error) {
            console.log(error);
        }

        const validateFile = {
            types: ['xls', 'xlsx'],
            size: '2mb',
            types: 'application'
        }

        const uploadData = request.file("detail-ritase-ob", validateFile)

        let aliasName

        if(uploadData){
            aliasName = `detail-ritase-ob-${moment().format('DDMMYYHHmmss')}.${uploadData.extname}`

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

            const data = convertJSON.FORM.filter(cell => cell.A != '#N/A')
            
            console.log(data);

            // const trx = await db.beginTransaction()

            try {
                const dailyRitase = new DailyRitase()
                dailyRitase.fill({
                    dailyfleet_id: req.dailyfleet_id,
                    exca_id: req.exca_id,
                    material: req.material,
                    distance: req.distance,
                    date: req.date
                })

                await dailyRitase.save()
                
                for (const item of data) {
                    var date = moment(req.date).format('YYYY-MM-DD')
                    // var clock = (item.E).replace('.', ':')
                    var clock = moment(item.E).format('HH:mm')
                    const ritaseDetail = new DailyRitaseDetail()
                    ritaseDetail.fill({
                        dailyritase_id: dailyRitase.id,
                        checker_id: req.checker_id,
                        spv_id: req.spv_id,
                        hauler_id: item.A,
                        opr_id: item.D,
                        check_in: date + ' ' + clock
                    })
                    await ritaseDetail.save()
                }
                
                return {
                    success: true,
                    message: 'data berhasil di upload...'
                } 
            } catch (error) {
                console.log(error);
                return {
                    success: false,
                    message: error.message
                }
            }

        }

    }

    async listByPIT ({ params, request, view }) {
        const req = request.only(['page', 'limit'])
        try {
            const dailyRitase = await DailyRitaseHelpers.BY_PIT(params, req)
            return view.render('operation.daily-ritase-ob.list-by', {
                list: dailyRitase.toJSON(), 
                filtered: 'pit',
                id: params.pit_id
            })
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    }

    async listByFLEET ({ params, request, view }) {
        const req = request.only(['page', 'limit'])
        try {
            const dailyRitase = await DailyRitaseHelpers.BY_FLEET(params, req)
            
            return view.render('operation.daily-ritase-ob.list-by', {
                list: dailyRitase.toJSON(), 
                filtered: 'fleet',
                id: params.fleet_id
            })
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    }

    async listBySHIFT ({ params, request, view }) {
        const req = request.only(['page', 'limit'])
        try {
            const dailyRitase = await DailyRitaseHelpers.BY_SHIFT(params, req)
            return view.render('operation.daily-ritase-ob.list-by', {
                list: dailyRitase.toJSON(), 
                filtered: 'shift',
                id: params.shift_id
            })
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    }

    async update ({ params, request }) {
        const req = JSON.parse(request.raw())
        try {
            await DailyRitaseHelpers.POST_RITASE_OB(params, req)
            return {
                success: true,
                message: 'success update data....'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'failed update data....'
            }
        }
    }

    async listUnitByRitase ({ request, view }) {
        const req = request.all()
        const dailyRitase = await DailyRitaseHelpers.RITASE_BY_DAILY_ID(req)
        let data = dailyRitase.toJSON()
        const timeSheet = (await TimeSheet.query().with('operator_unit').fetch()).toJSON()
        
        for (let [i, item] of data.entries()) {
            const xx = _.find(timeSheet, x => x.dailyfleet_id === item.daily_ritase.dailyfleet_id && x.unit_id === item.hauler_id)
            if(xx){
                data[i] = {...item, operator: xx.operator_unit.fullname}
            }else{
                data[i] = {...item, operator: 'not set'}
            }
        }
        return view.render('operation.daily-ritase-ob.show-detais-ritase', {list: data})
    }

    async show ({ params, view }) {
        try {
            const dailyRitase = await DailyRitaseHelpers.ID_SHOW(params)
            return view.render('operation.daily-ritase-ob.show', {
                data: dailyRitase.toJSON()
            })
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    }

    async updateDetails ({ params, request }) {
        const { id } = params
        const req = request.all()
        const dailyRitaseDetail = await DailyRitaseDetail.find(id)
        dailyRitaseDetail.merge(req)
        console.log(dailyRitaseDetail.toJSON());
        try {
            await db.table('daily_ritase_details').where('id', id).update(dailyRitaseDetail.toJSON())
            return {
                success: true,
                message: 'success update details....'
            }
        } catch (error) {
            return {
                success: false,
                message: 'failed update details....'
            }
        }
    }

    async detailDestroy ({ params, request }) {
        const { id } = params
        const dailyRitaseDetail = await DailyRitaseDetail.find(id)
        try {
            await dailyRitaseDetail.delete()
            return {
                success: true,
                message: 'success delete details....'
            }
        } catch (error) {
            return {
                success: false,
                message: 'failed delete details....'
            }
        }
    }
}

module.exports = DailyRitaseController
