'use strict'

const Env = use('Env')
const ENV_TYPE = Env.get('NODE_ENV')
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require("moment")
const CmsProject = use("App/Models/CmsProject")

const IMAGE_URI = ENV_TYPE != 'development' ? 'http://offices.mitraabadimahakam.id':'http://localhost:3001'

class PanelProjectController {
    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.project.index')
    }

    async list ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsProject.query().where('aktif', 'Y').orderBy('urut', 'asc').fetch()).toJSON()

        return view.render('cms.project.list', {list: data})
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.project.create')
    }

    async show ( { auth, params, request, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsProject.query().where('id', params.id).last()).toJSON()

        return view.render('cms.project.show', {data: data})
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
            const aliasName = `PROJECT-${moment().format('HHmmss')}.${clientPhoto.extname}`
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

        const cmsProject = new CmsProject()
        cmsProject.fill({
            lang: req.lang,
            name: req.name,
            type: req.type,
            caption: req.caption,
            title: req.title,
            img_url: photo
        })
        try {
            await cmsProject.save()
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
            const aliasName = `PROJECT-${params.id}.${clientPhoto.extname}`
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

        const cmsProject = await CmsProject.query().where('id', params.id).last()
        cmsProject.merge({
            lang: req.lang,
            name: req.name,
            type: req.type,
            caption: req.caption,
            title: req.title,
            img_url: photo
        })

        try {
            await cmsProject.save()
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

        const cmsProject = await CmsProject.query().where('id', params.id).last()
        cmsProject.merge({aktif: 'N'})

        try {
            await cmsProject.save()
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

module.exports = PanelProjectController

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
