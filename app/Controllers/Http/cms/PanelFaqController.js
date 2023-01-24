'use strict'

const Env = use('Env')
// const ENV_TYPE = Env.get('NODE_ENV')
// const Helpers = use('Helpers')
const CmsFaq = use("App/Models/CmsFaq")

// const IMAGE_URI = ENV_TYPE != 'development' ? 'http://offices.mitraabadimahakam.id':'http://localhost:3001'

class PanelFaqController {
    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.faq.index')
    }

    async list ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsFaq.query().where('aktif', 'Y').fetch()).toJSON()

        return view.render('cms.faq.list', {list: data})
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.faq.create')
    }

    async show ( { auth, params, request, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsFaq.query().where('id', params.id).last()).toJSON()

        return view.render('cms.faq.show', {data: data})
    }

    async store ( { auth, request } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const cmsFact = new CmsFaq()
        cmsFact.fill({
            lang: req.lang,
            faq_title: 'FAQ',
            faq_subtitle: req.faq_subtitle,
            faq_description: req.faq_description,
            urut: req.urut
        })
        try {
            await cmsFact.save()
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

        const cmsFact = await CmsFaq.query().where('id', params.id).last()
        cmsFact.merge({
            lang: req.lang,
            faq_subtitle: req.faq_subtitle,
            faq_description: req.faq_description,
            urut: req.urut
        })

        try {
            await cmsFact.save()
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

        const cmsFact = await CmsFaq.query().where('id', params.id).last()
        cmsFact.merge({aktif: 'N'})

        try {
            await cmsFact.save()
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

module.exports = PanelFaqController

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
