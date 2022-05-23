'use strict'

const FuelSummaryHelpers = use('App/Controllers/Http/Helpers/FuelUsageSummary')
const moment = require('moment')
const Helpers = use('Helpers')
const excelToJson = require('convert-excel-to-json')

class FuelUsageSummaryController {
  async index({ view }) {
    return view.render('operation.fuel-usage-summary.index')
  }

  async create({ view }) {
    return view.render('operation.fuel-usage-summary.create')
  }

  async show({ params, view }) {
    const data = await FuelSummaryHelpers.SHOW(params)
    return view.render('operation.fuel-usage-summary.show', {data: data})
  }

  async update ( { auth, params, request } ) {
    const req = request.all()
    const user = await userValidate(auth)
    if (!user) {
      return view.render('401')
    }

    if(!req.date){
      return {
        success: false,
        message: 'Tanggal belum ditentukan...'
      }
    }

    if(!req.site_id){
      return {
        success: false,
        message: 'Site belum ditentukan...'
      }
    }

    if(!req.pit_id){
      return {
        success: false,
        message: 'PIT belum ditentukan...'
      }
    }
    
    const data = await FuelSummaryHelpers.UPDATE(params, req, user)

    return data
  }

  async uploadFile({ auth, request }) {
    const validateFile = {
      types: ['xls', 'xlsx'],
      types: 'application',
    }

    const reqFile = request.file('fuel_usage_summary', validateFile)

    let aliasName
    if (reqFile) {
      aliasName = `${reqFile.clientName.split('.')[0]}-${moment().format('DDMMYYHHmmss')}.${reqFile.extname}`

      await reqFile.move(Helpers.publicPath(`/upload/`), {
        name: aliasName,
        overwrite: true,
      })

      if (!reqFile.moved()) {
        return reqFile.error()
      }

      var pathData = Helpers.publicPath(`/upload/`)

      const convertJSON = excelToJson({
        sourceFile: `${pathData}${aliasName}`,
        header: {
          rows: 4,
        },
      })

      var arr = Object.keys(convertJSON).map(function (key) {
        return key
      })

      return {
        title: arr,
        data: convertJSON,
        fileName: aliasName,
      }
    } else {
      return {
        title: ['No File Upload'],
        data: [],
      }
    }
  }

  async store({ auth, request }) {
    const req = request.all()

    try {
      await auth.getUser()
    } catch (err) {
      return {
        success: false,
        message: 'You are not authorized!',
      }
    }

    try {
      const { success, message } = await FuelSummaryHelpers.uploadDailyFuelSummary(req, await auth.getUser())

      return {
        success,
        message,
      }
    } catch (err) {
      return {
        success: false,
        message: 'Failed to store upload data to database \n Reason : ' + err.message,
      }
    }
  }

  async storeEntry ( { auth, request } ) {
    const req = request.all()
    const user = await userValidate(auth)
    if (!user) {
      return view.render('401')
    }

    if(!req.date){
      return {
        success: false,
        message: 'Tanggal belum ditentukan...'
      }
    }

    if(!req.site_id){
      return {
        success: false,
        message: 'Site belum ditentukan...'
      }
    }

    if(!req.pit_id){
      return {
        success: false,
        message: 'PIT belum ditentukan...'
      }
    }

    const data = await FuelSummaryHelpers.STORE_ENTRY(req, user)
    return data
  }

  async list({ auth, request, view }) {
    const req = request.all()
    const user = await userValidate(auth)
    if (!user) {
      return view.render('401')
    }

    let data = await FuelSummaryHelpers.LIST(req)

    data = {
      ...data,
      data: data.data.map(v => {
        return {
          ...v,
          date: moment(v.date).format('YYYY-MM-DD'),
        }
      }),
    }
    return view.render('operation.fuel-usage-summary.list', { list: data })
  }
  
}

module.exports = FuelUsageSummaryController

async function userValidate(auth) {
  let user
  try {
    user = await auth.getUser()
    return user
  } catch (error) {
    console.log(error)
    return null
  }
}
