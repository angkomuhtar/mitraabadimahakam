'use strict'
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const Pit = use("App/Models/MasPit")

class PitApiController {
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

        let pit
        if(req.keyword){
            pit = 
                await Pit
                    .query()
                    .with('site')
                    .where(word => {
                        word.where('kode', 'like', `%${req.keyword}%`)
                        word.orWhere('name', 'like', `%${req.keyword}%`)
                    })
                    .andWhere({sts: 'Y'})
                    .fetch()
        }else{
            pit = 
                await Pit.query().with('site').where({sts: 'Y'}).fetch()
        }

        let durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: pit
        })
    }
}

module.exports = PitApiController
