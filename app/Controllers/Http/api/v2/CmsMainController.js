'use strict'

const version = '2.0'
const _ = require('underscore')
const moment = require("moment")
const CmsMain = use("App/Models/CmsMain")
const CmsPage = use("App/Models/CmsPage")
const CmsContent = use("App/Models/CmsContent")
const CmsFaq = use("App/Models/CmsFaq")

class CmsMainController {
    async index ( { response } ) {
        let data = (await CmsMain.query().where('aktif', 'Y').last())?.toJSON()
        const pages = (
            await CmsPage.query().where('aktif', 'Y').fetch()
        ).toJSON()

        const faq = (
            await CmsFaq.query().where('aktif', 'Y').fetch()
        ).toJSON()

        return response.status(200).json({
            success: true,
            data: data,
            pages: pages,
            faqs:faq
        })
    }

    async carouselHome ( { response } ) {
        const data = await CmsContent.query()
        .with('items')
        .where( w => {
            w.where('type', 'carousel-home')
            w.where('aktif', 'Y')
        }).last()

        return response.status(200).json({
            success: true,
            data: data
        })
    }
    
    async aboutHome ( { response } ) {
        const data = await CmsContent.query()
        .with('items')
        .where( w => {
            w.where('type', 'about-home')
            w.where('aktif', 'Y')
        }).last()

        return response.status(200).json({
            success: true,
            data: data
        })
    }

    async serviceHome ( { response } ) {
        const data = await CmsContent.query()
        .with('items')
        .where( w => {
            w.where('type', 'service-home')
            w.where('aktif', 'Y')
        }).last()

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
            w.where('aktif', 'Y')
        }).last()

        return response.status(200).json({
            success: true,
            data: data
        })
    }

    async leadersHome ( { response } ) {
        const data = await CmsContent.query()
        .with('items')
        .where( w => {
            w.where('type', 'leaders-home')
            w.where('aktif', 'Y')
        }).last()

        return response.status(200).json({
            success: true,
            data: data
        })
    }
}

module.exports = CmsMainController
