'use strict'

const Env = use('Env')
const ENV_TYPE = Env.get('NODE_ENV')
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require("moment")
const CmsService = use("App/Models/CmsService")

const IMAGE_URI = ENV_TYPE != 'development' ? 'http://offices.mitraabadimahakam.id':'http://localhost:3001'

class PanelServiceController {
    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.service.index')
    }

    async list ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsService.query().where('aktif', 'Y').orderBy('urut', 'asc').fetch()).toJSON()

        return view.render('cms.service.list', {list: data})
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.service.create')
    }

    async show ( { auth, params, request, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsService.query().where('id', params.id).last()).toJSON()

        return view.render('cms.service.show', {data: data})
    }

    async store ( { auth, request } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const clientPhoto = request.file('file', {
            types: ['image'],
            size: '10mb'
        })

        let photo
        if(clientPhoto){
            const aliasName = `ABOUTUS-${moment().format('HHmmss')}.${clientPhoto.extname}`
            photo = IMAGE_URI+'/images/cms/'+aliasName
            await clientPhoto.move(Helpers.publicPath(`images/cms`), {
                name: aliasName,
                overwrite: true,
            })

            if (!clientPhoto.moved()) {
                return {
                    success: false,
                    message: 'Failed upload photo image... \n'+clientPhoto.error().message
                }
            }
        }

        const cmsService = new CmsService()
        cmsService.fill({
            lang: req.lang,
            title: req.title,
            img_position: req.img_position,
            details: req.details,
            img_url: photo
        })
        try {
            await cmsService.save()
            return {
                success: true,
                message: 'Success save data...'
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed save data...'
            }
        }
    }

    async update ( { auth, params, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const clientPhoto = request.file('file', {
            types: ['image'],
            size: '10mb'
        })

        let photo
        if(clientPhoto){
            const aliasName = `SERVICES-${params.id}.${clientPhoto.extname}`
            photo = IMAGE_URI+'/images/cms/'+aliasName
            await clientPhoto.move(Helpers.publicPath(`images/cms`), {
                name: aliasName,
                overwrite: true,
            })

            if (!clientPhoto.moved()) {
                return {
                    success: false,
                    message: 'Failed upload photo image... \n'+clientPhoto.error().message
                }
            }
        }

        const cmsService = await CmsService.query().where('id', params.id).last()
        cmsService.merge({
            lang: req.lang,
            title: req.title,
            img_position: req.img_position,
            details: req.details,
            img_url: photo
        })

        try {
            await cmsService.save()
            return {
                success: true,
                message: 'Success save data'
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed save data'
            }
        }
    }

    async destroy ( { auth, params } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const cmsService = await CmsService.query().where('id', params.id).last()
        cmsService.merge({aktif: 'N'})

        try {
            await cmsService.save()
            return {
                success: true,
                message: 'Success save data'
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed save data'
            }
        }
    }
}

module.exports = PanelServiceController

async function userValidate(auth){
    let user
    try {
        user = await auth.getUser()
        return user
    } catch (error) {
        console.log(error);
        return null
    }
}
