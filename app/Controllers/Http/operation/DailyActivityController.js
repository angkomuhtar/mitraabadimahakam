'use strict'

class DailyActivityController {
    async index ({auth, view, request}) {
        const usr = await auth.getUser()
        return view.render('operation.daily-activity.index')
    }
}

module.exports = DailyActivityController
