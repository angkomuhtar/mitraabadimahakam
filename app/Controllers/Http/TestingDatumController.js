'use strict'

const UserGroup = use("App/Models/UsersGroup")
const User = use("App/Models/User")

class TestingDatumController {
    async userGroup ({request}) {
        const user_grp = await User.query().with('sysgroup_user').fetch()
        return user_grp
    }

    async userModule ({auth, request}) {
        const usr = await auth.getUser()
        // const user_grp = await User.query().with('sysgroup_user').with('user_sysgroup').fetch()
        const user_grp = await User.query()
        .with('sysgroup_user')
        .with('sysgroup_user_mod', q => q.where('user_tipe', usr.user_tipe))
        .where('id', usr.id).first()
        
        return user_grp
    }
}

module.exports = TestingDatumController
