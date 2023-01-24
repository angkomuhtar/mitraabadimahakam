'use strict'

const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")
const { performance } = require('perf_hooks')
const MamTravelDocument = use("App/Models/MamTravelDocument")
const MamGallery = use("App/Models/MamGallery")
const moment = require('moment')
const Helpers = use('Helpers')

class TravelDocumentController {
    async index ( { auth, request, response } ) {
        var t0 = performance.now();
        let durasi
        try {
            await auth.authenticator("jwt").getUser();
        } catch (error) {
            console.log(error);
            durasi = await diagnoticTime.durasi(t0);
            return response.status(403).json({
              diagnostic: {
                times: durasi,
                error: true,
                message: error.message,
              },
              data: [],
            });
        }

        const req = request.all()

        try {
            
            const data = await MamTravelDocument.query()
                .with('pit')
                .with('gallery')
                .with('user_check')
                .with('user_approve')
                .where( w => {
                    if(req.checkby){
                        w.where('checkby', req.checkby)
                    }
                    if(req.site_id){
                        w.where('site_id', req.site_id)
                    }
                    if(req.tipe){
                        w.where('tipe', req.tipe)
                    }
                    if(req.delman){
                        w.where('tipe', 'like', `%${(req.delman).toUpperCase()}%`)
                    }
                    if(req.narasi){
                        w.where('tipe', 'like', `%${req.narasi}%`)
                    }
                    if(req.start_recived_at){
                        w.where('recived_at', '>=', req.start_recived_at)
                        w.where('recived_at', '<=', req.end_recived_at)
                    }
                    if(req.start_approve_at){
                        w.where('approve_at', '>=', req.start_approve_at)
                        w.where('approve_at', '<=', req.end_approve_at)
                    }
                    w.where('aktif', 'Y')
                }).fetch()

            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: data
            })
        } catch (error) {
            console.log(error);
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

    async store ( { auth, request, response } ) {
        var t0 = performance.now();
        let durasi
        const validateFile = {
            types: ['image'],
            size: '10mb'
        }

        try {
            await auth.authenticator("jwt").getUser();
        } catch (error) {
            console.log(error);
            durasi = await diagnoticTime.durasi(t0);
            return response.status(403).json({
              diagnostic: {
                times: durasi,
                error: true,
                message: error.message,
              },
              data: [],
            });
        }

        const req = request.only(['checkby', 'site_id', 'kode', 'delman', 'narasi', 'tipe', 'recived_at'])
        const reqPhoto = request.file('photo', validateFile)

        // console.log('reqPhoto ::', reqPhoto);

        req.kode = req.kode ? req.kode : `SJ${moment().format('YYMMDD')}.${moment().format('HHmmss')}`
        req.recived_at = req.recived_at ? req.recived_at : new Date()
        try {
            
            const newMamTravelDocument = new MamTravelDocument()
            newMamTravelDocument.fill({
                checkby: req.checkby,
                site_id: req.site_id,
                kode: req.kode,
                delman: (req.delman).toUpperCase(),
                narasi: req.narasi,
                tipe: req.tipe,
                recived_at: req.recived_at
            })
    
            await newMamTravelDocument.save()
            
            if(reqPhoto){
                for (const [i, obj] of (reqPhoto._files).entries()) {
                    const randURL = moment().format('YYYYMMDDHHmmss')
                    const aliasName = `photo-${randURL}.${i + 1}.${obj.extname}`
                    var uriGallery = '/upload/'+aliasName
                    await obj.move(Helpers.publicPath(`upload`), {
                        name: aliasName,
                        overwrite: true,
                    })
        
                    const mamGallery = new MamGallery()
                    mamGallery.fill({
                        traveldoc_id: newMamTravelDocument.id,
                        filetype: obj.subtype,
                        size: obj.size,
                        url: uriGallery
                    })
        
                    await mamGallery.save()
                }
            }

            const result = await MamTravelDocument.query().with('gallery').where('id', newMamTravelDocument.id).last()

            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: result
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

    async show ( { auth, params, response } ) {
        var t0 = performance.now();
        let durasi
        try {
            await auth.authenticator("jwt").getUser();
        } catch (error) {
            console.log(error);
            durasi = await diagnoticTime.durasi(t0);
            return response.status(403).json({
              diagnostic: {
                times: durasi,
                error: true,
                message: error.message,
              },
              data: [],
            });
        }


        try {
            const data = await MamTravelDocument.query()
                .with('pit')
                .with('gallery')
                .with('user_check')
                .with('user_approve')
                .where( w => {
                    w.where('id', params.id)
                    w.where('aktif', 'Y')
                }).fetch()

            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: data
            })
        } catch (error) {
            console.log(error);
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

    async update ( { auth, params, request, response } ) {
        var t0 = performance.now();
        let durasi
        try {
            await auth.authenticator("jwt").getUser();
        } catch (error) {
            console.log(error);
            durasi = await diagnoticTime.durasi(t0);
            return response.status(403).json({
              diagnostic: {
                times: durasi,
                error: true,
                message: error.message,
              },
              data: [],
            });
        }

        const req = request.only([
            'checkby', 
            'site_id', 
            'kode', 
            'delman', 
            'narasi', 
            'tipe', 
            'recived_at', 
            'approveby',
            'approve_at',
        ])

        req.delman = (req.delman).toUpperCase()
        let mamTravelDocument = await MamTravelDocument.query()
                .with('pit')
                .with('gallery')
                .with('user_check')
                .with('user_approve')
                .where( w => {
                    w.where('id', params.id)
                }).last()
        try {
            mamTravelDocument.merge(req)
            await mamTravelDocument.save()

            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: mamTravelDocument
            })
        } catch (error) {
            console.log(error);
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

    async destroy ( { auth, params, response } ) {
        var t0 = performance.now();
        let durasi
        try {
            await auth.authenticator("jwt").getUser();
        } catch (error) {
            console.log(error);
            durasi = await diagnoticTime.durasi(t0);
            return response.status(403).json({
              diagnostic: {
                times: durasi,
                error: true,
                message: error.message,
              },
              data: [],
            });
        }

        let mamTravelDocument = 
            await MamTravelDocument.query()
                .with('pit')
                .with('gallery')
                .with('user_check')
                .with('user_approve')
                .where( w => {
                    w.where('id', params.id)
                }).last()
        try {
            mamTravelDocument.merge({aktif: 'N'})
            await mamTravelDocument.save()

            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: mamTravelDocument
            })
        } catch (error) {
            console.log(error);
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

module.exports = TravelDocumentController
