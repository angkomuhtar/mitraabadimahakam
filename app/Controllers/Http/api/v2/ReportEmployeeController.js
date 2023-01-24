'use strict'

const version = '2.0'
const _ = require('underscore')
const moment = require("moment")
const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

class ReportEmployeeController {
    async index ( { auth, request, response } ) {}
}

module.exports = ReportEmployeeController

async function userValidate(auth){
    let user
    try {
        user = await auth.authenticator('jwt').getUser()
        return user
    } catch (error) {
        console.log(error);
        return null
    }
}