'use strict'

const Env = use('Env')
const ENV_TYPE = Env.get('NODE_ENV')
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require("moment")
const CmsAbout = use("App/Models/CmsAbout")

const IMAGE_URI = ENV_TYPE != 'development' ? 'http://offices.mitraabadimahakam.id':'http://localhost:3001'

class PanelAboutUsController {
    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.about-us.index')
    }

    async list ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsAbout.query().where('aktif', 'Y').orderBy('urut', 'asc').fetch()).toJSON()

        return view.render('cms.about-us.list', {list: data})
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.about-us.create')
    }

    async show ( { auth, params, request, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsAbout.query().where('id', params.id).last()).toJSON()

        return view.render('cms.about-us.show', {data: data})
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

        const cmsAbout = new CmsAbout()
        cmsAbout.fill({
            lang: req.lang,
            title: req.title,
            subtitle: req.subtitle,
            img_position: req.img_position || null,
            details: req.details,
            img_url: photo
        })
        try {
            await cmsAbout.save()
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
            const aliasName = `ABOUTUS-${params.id}.${clientPhoto.extname}`
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

        const cmsAbout = await CmsAbout.query().where('id', params.id).last()
        cmsAbout.merge({
            lang: req.lang,
            title: req.title,
            subtitle: req.subtitle,
            img_position: req.img_position || null,
            details: req.details,
            img_url: photo
        })

        try {
            await cmsAbout.save()
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

        const cmsAbout = await CmsAbout.query().where('id', params.id).last()
        cmsAbout.merge({aktif: 'N'})

        try {
            await cmsAbout.save()
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

module.exports = PanelAboutUsController

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
