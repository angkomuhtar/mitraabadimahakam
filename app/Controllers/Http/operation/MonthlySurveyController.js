'use strict'

const MonthlySurvey = use("App/Models/MonthlySurvey")

class MonthlySurveyController {
  async index ({ view }) {
    return view.render('operation.monthly-survey.index')
  }

  async list ({ request, view }) {
    return view.render('operation.monthly-survey.index.list')
  }

  async create ({ request, view }) {
    return view.render('operation.monthly-survey.create')
  }

  async show ({ params, request, view }) {
    return view.render('operation.monthly-survey.show')
  }

  async store ({ auth, request }) {

  }

  async update ({ auth, params, request }) {

  }

}

module.exports = MonthlySurveyController
