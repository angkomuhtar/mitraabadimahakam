'use strict'

const SopHelpers = use('App/Controllers/Http/Helpers/Sop')
const excelToJson = require('convert-excel-to-json')
const moment = require('moment')
const Helpers = use('Helpers')

class SopController {
  async index({ view }) {
    return view.render('operation.sop.index')
  }

  async create({ view }) {
    return view.render('operation.sop.create')
  }

  async store({ request }) {
    const req = request.all()

    try {
      await SopHelpers.uploadNewSOP(req)

      return {
        sucess: true,
        message: 'Upload New SOP Success ...',
      }
    } catch (err) {
      return {
        success: false,
        message: 'You are not authorized!',
      }
    }
  }

  async uploadFile({ auth, request }) {
    const validateFile = {
      types: ['pdf'],
      types: 'application',
    }

    const reqFile = request.file('sop_file', validateFile)

    if (reqFile.extname !== 'pdf') {
      return {
        success: false,
        message: 'Tipe file SOP harus PDF !',
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

      return {
        title: [],
        data: [],
        fileName: aliasName,
      }
    } else {
      return {
        success : false,
        message: 'Gagal mengupload file SOP ..., silahkan coba lagi',
      }
    }
  }

  async list({ auth, request, view }) {
    const req = request.all()
    const user = await userValidate(auth)
    if (!user) {
      return view.render('401')
    }
    const data = await SopHelpers.LIST(req)
    console.log(data)
    return view.render('operation.sop.list', { list: data })
  }
}

module.exports = SopController

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
