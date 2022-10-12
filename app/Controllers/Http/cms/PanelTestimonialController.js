'use strict'

const Env = use('Env')
const ENV_TYPE = Env.get('NODE_ENV')
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require("moment")
const CmsTestimoni = use("App/Models/CmsTestimoni")

const IMAGE_URI = ENV_TYPE != 'development' ? 'http://offices.mitraabadimahakam.id':'http://localhost:3001'

class PanelTestimonialController {
    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.testimonial.index')
    }

    async list ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsTestimoni.query().where('aktif', 'Y').orderBy('urut', 'asc').fetch()).toJSON()

        return view.render('cms.testimonial.list', {list: data})
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.testimonial.create')
    }

    async show ( { auth, params, request, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsTestimoni.query().where('id', params.id).last()).toJSON()

        return view.render('cms.testimonial.show', {data: data})
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
            const aliasName = `TESTIMONI-${moment().format('HHmmss')}.${clientPhoto.extname}`
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

        const cmsTestimoni = new CmsTestimoni()
        cmsTestimoni.fill({
            lang: req.lang,
            name: req.name,
            type: req.type,
            comment: req.comment,
            img_url: photo
        })
        try {
            await cmsTestimoni.save()
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
            const aliasName = `CAROUSEL-${params.id}.${clientPhoto.extname}`
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

        const cmsTestimoni = await CmsTestimoni.query().where('id', params.id).last()
        cmsTestimoni.merge({
            lang: req.lang,
            name: req.name,
            type: req.type,
            comment: req.comment,
            img_url: photo
        })

        try {
            await cmsTestimoni.save()
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

        const cmsTestimoni = await CmsTestimoni.query().where('id', params.id).last()
        cmsTestimoni.merge({aktif: 'N'})

        try {
            await cmsTestimoni.save()
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

module.exports = PanelTestimonialController

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
