'use strict'
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const Activity = use("App/Models/MasActivity")

class ActivitiesApiController {
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

        let activities
        if(req.keyword){
            activities = 
                await Activity
                    .query()
                    .where(word => {
                        word.where('kode', 'like', `%${req.keyword}%`)
                        word.orWhere('name', 'like', `%${req.keyword}%`)
                    })
                    .andWhere({sts: 'Y'})
                    .fetch()
        }else{
            activities = 
                await Activity.query().where({sts: 'Y'}).fetch()
        }

        let durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: activities
        })
    }
}

module.exports = ActivitiesApiController
