'use strict'

const DB = use('Database')
const Helpers = use('Helpers')
const _ = require('underscore')
const moment = require('moment')
const RefuelUnitHelpers = use("App/Controllers/Http/Helpers/Fuel")

class DailyIssueController {
    async index ( { auth, view } ) {
        console.log('XXXX');
        return view.render('operation.daily-issue.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        return view.render('operation.daily-issue.list')
    }

    async create ({ request, view }) {
        const req = request.all()
        return view.render('operation.daily-issue.create')
    }
}

module.exports = DailyIssueController
