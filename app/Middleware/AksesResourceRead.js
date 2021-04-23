'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const v_Akses = use("App/Models/VPrivilege")

class AksesResourceRead {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, response, auth }, next) {
    // call next to advance the request
    const uri = (request.url()).split('/')
    
    const usr = await auth.getUser()
    const name = uri[2]
    if(usr.user_tipe === 'administrator'){
      await next()
    }

    const akses = await v_Akses.query().where({usertipe: usr.user_tipe, nm_module: name, method: 'R'}).first()
    if(akses){
      await next()
    }else{
      console.log('====================================');
      console.log(uri);
      console.log('====================================');
      // response.redirect('back')
      // response.redirect('/401', false, 301)
    }
  }
}

module.exports = AksesResourceRead
