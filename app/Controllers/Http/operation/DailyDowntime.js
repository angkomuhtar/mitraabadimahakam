'use strict'

const DailyDowntimeHelpers = use('App/Controllers/Http/Helpers/DailyDowntime')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const Helpers = use('Helpers')
const fs = require('fs')

class DailyDowntime {
  async index({ view }) {
    return view.render('operation.daily-downtime-equipment.index')
  }

  async create({ view }) {
    return view.render('operation.daily-downtime-equipment.create')
  }

  async uploadFile({ auth, request }) {
    const validateFile = {
      types: ['pdf'],
      types: 'application',
    }

    const reqFile = request.file('daily_downtime_upload', validateFile)

    if (!reqFile.extname.includes('xlsx')) {
      return {
        success: false,
        message: 'Tipe file yang di upload harus xls / xlsx !',
      }
    }

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
        data: [],
        fileName: aliasName,
      }
    } else {
      return {
        success: false,
        message: 'Gagal mengupload file Daily Downtime ..., silahkan coba lagi',
      }
    }
  }

  async store({ request, auth }) {
    const req = request.all()

    let user = null
    try {
      user = await auth.getUser()
    } catch (err) {
      return {
        error: true,
        message: err.message,
        validation: 'You are not authorized !',
      }
    }

    const fileName = req.current_file_name ? JSON.parse(req.current_file_name) : false

    var pathData = Helpers.publicPath(`/upload/`)
    const filePath = `${pathData}${fileName}`

    if (req.tipe && req.tipe === 'downtime') {
      try {
        const { success, message } = await DailyDowntimeHelpers.uploadProcessActivity(req, filePath, user)
        // if success upload then we delete the uploaded's file immediately
        fs.unlink(filePath, err => {
          if (err) {
            console.log(`failed when deleting ${filePath} file`)
          }
          console.log(`${filePath} is deleted from directory`)
        })

        return {
          success,
          message
        }
      } catch (err) {
        return {
          success: false,
          message: 'Failed when uploading daily downtime, please try again.',
          reason: err.message,
        }
      }
    } else {
      // Equipment's Hour Meter Upload
      try {
        const { success, message } = await DailyDowntimeHelpers.uploadProcessHourMeter(req, filePath, user)
        fs.unlink(filePath, err => {
          if (err) {
            console.log(`failed when deleting ${filePath} file`)
          }
          console.log(`${filePath} is deleted from directory`)
        })

        return {
          success,
          message
        }
      } catch (err) {
        return {
          success: false,
          message: 'Failed when uploading daily hour meter, please try again. Reason : \n' + err.message,
          reason: err.message,
        }
      }
    }
  }

  async list({ auth, request, view }) {
    const req = request.all()
    const user = await userValidate(auth)
    if (!user) {
      return view.render('401')
    }
    const data = await DailyDowntimeHelpers.LIST(req)
    return view.render('operation.daily-downtime-equipment.list', { list: data })
  }
}

module.exports = DailyDowntime

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
