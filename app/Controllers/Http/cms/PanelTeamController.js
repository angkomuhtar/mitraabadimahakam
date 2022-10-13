'use strict'

const Env = use('Env')
const ENV_TYPE = Env.get('NODE_ENV')
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require("moment")
const CmsTeam = use("App/Models/CmsTeam")

const IMAGE_URI = ENV_TYPE != 'development' ? 'http://offices.mitraabadimahakam.id':'http://localhost:3001'

class PanelTeamController {
    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.team.index')
    }

    async list ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsTeam.query().where('aktif', 'Y').orderBy('urut', 'asc').fetch()).toJSON()

        return view.render('cms.team.list', {list: data})
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.team.create')
    }

    async show ( { auth, params, request, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsTeam.query().where('id', params.id).last()).toJSON()

        return view.render('cms.team.show', {data: data})
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
            const aliasName = `TEAMS-${moment().format('HHmmss')}.${clientPhoto.extname}`
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

        const cmsTestimoni = new CmsTeam()
        cmsTestimoni.fill({
            lang: req.lang,
            name: req.name,
            group: req.group,
            title: req.title,
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
            const aliasName = `TEAMS-${params.id}.${clientPhoto.extname}`
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

        const cmsTestimoni = await CmsTeam.query().where('id', params.id).last()
        cmsTestimoni.merge({
            lang: req.lang,
            name: req.name,
            group: req.group,
            title: req.title,
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

        const cmsTestimoni = await CmsTeam.query().where('id', params.id).last()
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

module.exports = PanelTeamController

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
