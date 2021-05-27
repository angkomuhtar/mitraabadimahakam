'use strict'
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const Shift = use("App/Models/MasShift")

class ShiftApiController {
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

        let shift
        if(req.keyword){
            shift = 
                await Shift
                    .query()
                    .where(word => {
                        word.where('kode', 'like', `%${req.keyword}%`)
                        word.orWhere('name', 'like', `%${req.keyword}%`)
                    })
                    .andWhere({status: 'Y'})
                    .fetch()
        }else{
            shift = 
                await Shift.query().where({status: 'Y'}).fetch()
        }

        let durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: shift
        })
    }
}

module.exports = ShiftApiController
