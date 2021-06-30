'use strict'

const moment = require('moment')
const MonthlyPlanHelpers = use("App/Controllers/Http/Helpers/MonthlyPlan")

class MonthlyPlanApiController {
  
  async index ({ request, response, view }) {
  }

  
  async create ({ request, response, view }) {

    const req = {
      pit_id: 1, 
      // start_plan: moment().startOf('month'), 
      // end_plan: moment().endOf('month'), 
      month: '2021-06-01 00:01', 
      estimate: 122400, 
      actual: 0
    }

    await MonthlyPlanHelpers.POST(req)
  }
  
  async show ({ params, request, response, view }) {
  }

  
  async edit ({ params, request, response, view }) {
  }

  
  async update ({ params, request, response }) {
  }

  
  async destroy ({ params, request, response }) {
  }
}

module.exports = MonthlyPlanApiController
