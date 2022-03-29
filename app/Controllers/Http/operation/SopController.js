'use strict'

const SopHelpers = use('App/Controllers/Http/Helpers/Sop')

class SopController {
    async index ( { view } ) {
        return view.render('operation.sop.index')
    }

    async list ( { auth, request, view } ) {
        const req = request.all()
        const user = await userValidate(auth)
        if(!user){
            return view.render('401')
        }

        const data = await SopHelpers.LIST(req)
        console.log(data);
        return view.render('operation.sop.list', { list: data })
    }
}

module.exports = SopController

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