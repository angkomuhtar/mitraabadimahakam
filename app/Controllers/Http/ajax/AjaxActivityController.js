'use strict'

const Activity = use("App/Models/MasActivity")

class AjaxActivityController {
    async getActivities ({ request }) {
        const req = request.all()
        const activity = (await Activity.query().where({sts: 'Y'}).orderBy('created_at', 'desc').fetch()).toJSON()
        const list = activity.map(el => el.id === parseInt(req.selected) ? {...el, selected: 'selected'} : {...el, selected: ''})

        return list
    }

    async getActivitiesID ({ params }) {
        const { id } = params
        const activities = await Activity.findOrFail(id)
        return activities
    }
}

module.exports = AjaxActivityController
