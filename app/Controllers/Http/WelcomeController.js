'use strict'

const VUser = use("App/Models/VUser")
const Profile = use("App/Models/Profile")

class WelcomeController {
    async index ({view, auth, response}) {
        let usr
        try {
            await auth.check()
            usr = await auth.getUser()
        } catch (error) {
            console.log(error);
            return response.route('login')
        }

        
        return view.render('welcome')
    }

    async jsonData ({}) {
        const user = (
            await VUser.query()
            .with('user_menu')
            .with('user_menuDetail')
            .first()
        ).toJSON()
        const {user_menu, user_menuDetail} = user
        const data = user_menu.map(elm => {
            return {
                ...elm,
                submenu: user_menuDetail.filter(fill => fill.menu_id === elm.id)
            }
        })
        return data
    }
}

module.exports = WelcomeController
