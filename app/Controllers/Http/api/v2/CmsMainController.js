'use strict'

const version = '2.0'
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

const MasEquipment = use("App/Models/MasEquipment");

class CmsMainController {
    async index ( { params, response } ) {
        
        let data = (await CmsMain.query().where( w => {
            w.where('aktif', 'Y')
            w.where('lang', params.lang)
        }).last())?.toJSON()

        const pages = (
            await CmsPage.query().where( w => {
                w.where('aktif', 'Y')
                w.where('lang', params.lang)
            }).fetch()
        ).toJSON()
        data = {...data, menu: pages}

        const cmsCarousel = (
            await CmsCarousel.query().where( w => {
                w.where('aktif', 'Y')
                w.where('lang', params.lang)
            }).fetch()
        ).toJSON()
        data = {...data, carousel: cmsCarousel}

        const cmsFeature = (
            await CmsFeature.query().where( w => {
                w.where('aktif', 'Y')
                w.where('lang', params.lang)
            }).fetch()
        ).toJSON()
        data = {...data, feature: cmsFeature}

        const cmsAbout = (
            await CmsAbout.query().where( w => {
                w.where('aktif', 'Y')
                w.where('lang', params.lang)
            }).first()
        )?.toJSON()
        data = {...data, about: cmsAbout}

        const cmsFact = (
            await CmsFact.query().where( w => {
                w.where('aktif', 'Y')
                w.where('lang', params.lang)
            }).fetch()
        ).toJSON()
        data = {...data, fact: cmsFact}

        const faq = (
            await CmsFaq.query().where( w => {
                w.where('aktif', 'Y')
                w.where('lang', params.lang)
            }).fetch()
        ).toJSON()

        data = {...data, faqs: faq}

        const cmsTestimoni = (
            await CmsTestimoni.query().where( w => {
                w.where('aktif', 'Y')
                w.where('lang', params.lang)
            }).fetch()
        ).toJSON()

        data = {...data, testimoni: cmsTestimoni}

        return response.status(200).json({
            success: true,
            data: data,
            pages: pages,
        })
    }

    async defaultLang ( { response } ) {
        const lang = (await CmsLang.query().where('default', 'Y').last()).toJSON()

        return response.status(200).json({
            success: true,
            data: lang
        })
    }

    async carouselHome ( { response } ) {
        const data = await CmsContent.query()
        .with('items')
        .where( w => {
            w.where('type', 'carousel-home')
            w.where( w => {
                w.where('aktif', 'Y')
                
            })
        }).last()

        return response.status(200).json({
            success: true,
            data: data
        })
    }
    
    async aboutHome ( { params, response } ) {
        const data = (
            await CmsAbout.query()
            .where( w => {
                w.where('lang', params.lang)
                w.where('aktif', 'Y')
            }).fetch()
        ).toJSON()

        return response.status(200).json({
            success: true,
            data: data
        })
    }

    async serviceHome ( { params, response } ) {
        const data = await CmsService.query()
        .where( w => {
            w.where('lang', params.lang)
            w.where('aktif', 'Y')
        }).orderBy('urut', 'asc').fetch()

        return response.status(200).json({
            success: true,
            data: data
        })
    }

    async testimonialHome ( { response } ) {
        const data = await CmsContent.query()
        .with('items')
        .where( w => {
            w.where('type', 'testimonial-home')
            w.where( w => {
                w.where('aktif', 'Y')
                
            })
        }).last()

        return response.status(200).json({
            success: true,
            data: data
        })
    }

    async teamHome ( { response } ) {
        let data = (await CmsTeam.query()
        .where( w => {
            w.where('aktif', 'Y')
        }).fetch()).toJSON()

        data = _.groupBy(data, 'group')
        data = Object.keys(data).map(key => {
            return {
                group: key,
                member: data[key]
            }
        })

        return response.status(200).json({
            success: true,
            data: data
        })
    }

    async equipment ( { response } ) {
        let equipment = (await MasEquipment.query().where('aktif', 'Y').fetch()).toJSON()
        equipment = _.groupBy(equipment, 'unit_model')
        equipment = Object.keys(equipment).map( key => {
            return {
                model: key,
                qty: equipment[key].length,
                tipe: equipment[key][0].tipe,
                brand: equipment[key][0].brand,
                year: moment(equipment[key][0].received_date).format('YYYY'),
                item: equipment[key]
            }
        })
        return equipment
    }
}

module.exports = CmsMainController
