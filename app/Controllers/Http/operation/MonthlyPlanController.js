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

  
  async create ({ request, view }) {
    return view.render('operation.monthly-plan.create')
  }

  
  async store ({ request, response }) {
    const req = request.only(['pit_id', 'tipe', 'month', 'estimate'])
    console.log(req);
    try {
      await MonthlyPlanHelpers.POST(req)
      return {
        success: true,
        message: 'Success save data...'
      }
    } catch (error) {
      console.log(error)
      return {
        success: false,
        message: 'Failed save data...'
      }
    }
  }

  
  async show ({ params, view }) {
    try {
      const data = (await MonthlyPlanHelpers.GET_ID(params)).toJSON()
      return view.render('operation.monthly-plan.show', {data: data})
    } catch (error) {
      return view.render('404')
    }
  }

  
  async update ({ params, request }) {
    const req = request.only(['pit_id', 'tipe', 'month', 'estimate'])
    try {
      await MonthlyPlanHelpers.UPDATE(params, req)
      return {
        success: true,
        message: 'Success update data...'
      }
    } catch (error) {
      console.log(error)
      return {
        success: false,
        message: 'Failed update data...'
      }
    }
  }
}

module.exports = MonthlyPlanController
