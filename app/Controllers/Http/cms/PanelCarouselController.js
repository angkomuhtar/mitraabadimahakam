'use strict'

const Helpers = use('Helpers')
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

class PanelCarouselController {
    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.carousel-img.index')
    }

    async list ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsCarousel.query().where('aktif', 'Y').fetch()).toJSON()

        return view.render('cms.carousel-img.list', {list: data})
    }

    async show ( { auth, params, request, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsCarousel.query().where('id', params.id).last()).toJSON()

        return view.render('cms.carousel-img.show', {data: data})
    }

    async update ( { auth, params, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const carouselImg = request.file('file', {
            types: ['image'],
            size: '10mb'
        })

        let imageCarousel
        if(carouselImg){
            const aliasName = `CAROUSEL-${params.id}.${carouselImg.extname}`
            imageCarousel = 'http://'+request.headers().host+'/images/cms/'+aliasName
            await carouselImg.move(Helpers.publicPath(`images/cms`), {
                name: aliasName,
                overwrite: true,
            })

            if (!carouselImg.moved()) {
                return {
                    success: false,
                    message: 'Failed upload photo image... \n'+carouselImg.error().message
                }
            }
        }

        const cmsCarousel = await CmsCarousel.query().where('id', params.id).last()
        cmsCarousel.merge({
            lang: req.lang,
            title: req.title,
            subtitle: req.subtitle,
            details: req.details,
            img_url: imageCarousel
        })

        try {
            await cmsCarousel.save()
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

module.exports = PanelCarouselController

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
