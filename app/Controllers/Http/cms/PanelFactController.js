'use strict'

const Env = use('Env')
// const ENV_TYPE = Env.get('NODE_ENV')
// const Helpers = use('Helpers')
const CmsFact = use("App/Models/CmsFact")

// const IMAGE_URI = ENV_TYPE != 'development' ? 'http://offices.mitraabadimahakam.id':'http://localhost:3001'

class PanelFactController {
    async index ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.fact.index')
    }

    async list ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsFact.query().where('aktif', 'Y').fetch()).toJSON()

        return view.render('cms.fact.list', {list: data})
    }

    async create ( { auth, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        return view.render('cms.fact.create')
    }

    async show ( { auth, params, request, view } ) {
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = (await CmsFact.query().where('id', params.id).last()).toJSON()

        return view.render('cms.fact.show', {data: data})
    }

    async store ( { auth, request } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const cmsFact = new CmsFact()
        cmsFact.fill({
            lang: req.lang,
            title: req.title,
            subtitle: req.subtitle,
            urut: req.urut,
            img_url: req.img_url
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

        const cmsFact = await CmsFact.query().where('id', params.id).last()
        cmsFact.merge({
            lang: req.lang,
            title: req.title,
            subtitle: req.subtitle,
            urut: req.urut,
            img_url: req.img_url
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

        const cmsFact = await CmsFact.query().where('id', params.id).last()
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

module.exports = PanelFactController

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
