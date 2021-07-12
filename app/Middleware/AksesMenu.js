'use strict'

const User = use("App/Models/User")
const SysError = use("App/Models/SysError")

class AksesMenu {
  
  async handle ({ response, auth, view }, next) {
    // call next to advance the request
    try {
      const user = await auth.getUser()
      const check = await auth.check()
      if(check){
        const usr = (await User.query().with('tokens').where('id', user.id).first()).toJSON()
        if(usr.tokens.length === 0 || usr.status != 'Y'){
          await auth.logout()
          return response.redirect('/login')
        }
        const userData = (
          await User.query()
          .with('user_menu', q => {
            q.orderBy('urut')
            // q.where('id', usr.id)
          })
          .with('user_menuDetail', q => {
            q.orderBy('urut')
            // q.where('id', usr.id)
          })
          .where('id', usr.id)
          .first()
        ).toJSON()
        const {user_menu, user_menuDetail} = userData
        const data = user_menu.map(elm => {
            return {
                ...elm,
                submenu: user_menuDetail.filter(fill => fill.menu_id === elm.id)
            }
        })
        // console.log(data)
        view.share({
          data: data,
          user: user.toJSON()
        })
      }
    } catch (error) {
      console.log(error)
      const syserror = new SysError()
      syserror.fill({name: error.code, description: '', error_by: null})
      await syserror.save()
      return response.route('auth.login')
    }


    
    await next()
  }
}

module.exports = AksesMenu
