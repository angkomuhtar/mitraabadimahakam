'use strict'

const _ = require('underscore')
const moment = require("moment")
const CmsMain = use("App/Models/CmsMain")
const CmsPage = use("App/Models/CmsPage")
const CmsContent = use("App/Models/CmsContent")
const CmsFaq = use("App/Models/CmsFaq")
const CmsFact = use("App/Models/CmsFact")
const CmsLang = use("App/Models/CmsLang")
const CmsCarousel = use("App/Models/CmsCarousel")
const CmsFeature = use("App/Models/CmsFeature")
const CmsAbout = use("App/Models/CmsAbout")
const CmsTeam = use("App/Models/CmsTeam")
const CmsService = use("App/Models/CmsService")
const CmsTestimoni = use("App/Models/CmsTestimoni")

class PanelMainCMSController {
    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsMain.query().where('aktif', 'Y').first()).toJSON()
        const fact = (await CmsFact.query().where( w => {
            w.where('aktif', 'Y')
            w.where('lang', 'en')
        }).fetch()).toJSON()

        return view.render('cms.home.index', {
            data: data,
            fact: fact
        })
    }

    async update ( { auth, params, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await CmsMain.query().where('id', params.id).first()
        data.merge(req)
        try {
            await data.save()
            return {
                success: true,
                message: 'success update data...'
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'failed update data...'
            }
        }
    }
}

module.exports = PanelMainCMSController

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
