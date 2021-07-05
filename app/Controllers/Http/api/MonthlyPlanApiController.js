'use strict'

const moment = require('moment')
const MonthlyPlanHelpers = use("App/Controllers/Http/Helpers/MonthlyPlan")

class MonthlyPlanApiController {
  
  async index ({ request, response, view }) {
  }

  
  async create ({ request, response, view }) {
    const req = request.all()
   try {
     const data = await MonthlyPlanHelpers.POST(req)
     return data
   } catch (error) {
     console.log(error);
   }
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
