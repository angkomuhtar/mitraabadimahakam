'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const v_Akses = use("App/Models/VPrivilege")


class AksesResourceCreate {

  async handle ({ request, response, auth }, next) {
    const uri = (request.url()).split('/')
    const usr = await auth.getUser()
    const name = uri[2]
    
    if(usr.user_tipe === 'administrator'){
      await next()
    }else{
      const akses = await v_Akses.query().where({usertipe: usr.user_tipe, nm_module: name, method: 'C'}).first()
      if(akses){
        await next()
      }else{
        response.status(404).json({success: false, message: 'You not authorized....'})
      }
    }

    
  }
}

module.exports = AksesResourceCreate
