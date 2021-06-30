'use strict'

const MonthlyPlanHelpers = use("App/Controllers/Http/Helpers/MonthlyPlan")

class MonthlyPlanController {
  
  async index ({ request, response, view }) {
    return view.render('operation.monthly-plan.index')
  }

  async listBulanan ({ request, response, view }) {
    const req = request.only(['page', 'keyword'])

    try {
      const data = await MonthlyPlanHelpers.ALL_MONTHLY(req)
      return view.render('operation.monthly-plan.list', {list: data.toJSON()})
    } catch (error) {
      console.log(error);
    }
  }

  async listHarian ({ request, response, view }) {
    const req = request.all()

    try {
      const data = await MonthlyPlanHelpers.ALL_DAILY(req)
      return view.render('operation.monthly-plan.list-details', {list: data.toJSON()})
    } catch (error) {
      console.log(error);
    }
  }

  
  async create ({ request, response, view }) {
  }

  
  async store ({ request, response }) {
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

module.exports = MonthlyPlanController
