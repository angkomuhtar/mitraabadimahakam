'use strict'

const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const Fleet = use("App/Models/MasFleet")

class FleetApiController {
    async index ({auth, request, response}){
        var t0 = performance.now()
        const req = request.only(['keyword'])
        try {
            await auth.authenticator('jwt').getUser()
            let fleet = 
                await Fleet
                    .query()
                    .where(word => {
                        word.where('kode', 'like', `%${req.keyword}%`)
                        word.orWhere('name', 'like', `%${req.keyword}%`)
                    })
                    .andWhere({status: 'Y'})
                    .fetch()
            
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: fleet
            })
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
    }

    async show ({auth, params, response}) {
        var t0 = performance.now()
        const { id } = params
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

        const fleet = 
            await Fleet.query()
                .where({id: id, status: 'Y'})
                .first()

        let durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: fleet
        })
    }

    async update ({auth, params, request, response}) {
        var t0 = performance.now()
        const { id } = params
        const data = request.only(['kode', 'name', 'status'])
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

        const fleet = await Fleet.findByOrFail(id)
        fleet.merge(data)

        try {
            await fleet.save()
        } catch (error) {
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(500).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }
    }
}

module.exports = FleetApiController
