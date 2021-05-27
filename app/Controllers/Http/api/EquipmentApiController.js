'use strict'
const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const Equipment = use("App/Models/MasEquipment")

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
}

module.exports = EquipmentApiController
