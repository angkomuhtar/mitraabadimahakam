'use strict'

const Env = use('Env')
// const ENV_TYPE = Env.get('NODE_ENV')
// const Helpers = use('Helpers')
const CmsFeature = use("App/Models/CmsFeature")

// const IMAGE_URI = ENV_TYPE != 'development' ? 'http://offices.mitraabadimahakam.id':'http://localhost:3001'

class PanelFeatureController {
    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.feature.index')
    }

    async list ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsFeature.query().where('aktif', 'Y').fetch()).toJSON()

        return view.render('cms.feature.list', {list: data})
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.feature.create')
    }

    async show ( { auth, params, request, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsFeature.query().where('id', params.id).last()).toJSON()

        return view.render('cms.feature.show', {data: data})
    }

    async store ( { auth, request } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const cmsFeature = new CmsFeature()
        cmsFeature.fill({
            lang: req.lang,
            title: req.title,
            subtitle: req.subtitle,
            urut: req.urut,
            img_url: req.img_url
        })
        try {
            await cmsFeature.save()
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

        const cmsFeature = await CmsFeature.query().where('id', params.id).last()
        cmsFeature.merge({
            lang: req.lang,
            title: req.title,
            subtitle: req.subtitle,
            urut: req.urut,
            img_url: req.img_url
        })

        try {
            await cmsFeature.save()
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

        const cmsFeature = await CmsFeature.query().where('id', params.id).last()
        cmsFeature.merge({aktif: 'N'})

        try {
            await cmsFeature.save()
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

module.exports = PanelFeatureController

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
