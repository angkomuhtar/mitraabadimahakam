'use strict'


const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")
const BarangHelpers = use("App/Controllers/Http/Helpers/Barang")
const utils = use("App/Controllers/Http/customClass/utils")

class MasBarangController {
  async index ({ auth, view }) {
    const user = await userValidate(auth)
    if(!user){
        return view.render('401')
    }
    return view.render('master.barang.index')
  }

  async list ({ request, view }) {
    const req = request.all()
    try {
      const data = await BarangHelpers.ALL(req)
      return view.render('master.barang.list', {list: data.toJSON()})
    } catch (error) {
      return view.render('404')
    }
  }

  async create ({ auth, request, view }) {
    const usr = await auth.getUser()
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    
    return view.render('master.barang.create')
  }

  async store ({ auth, request }) {
    const req = request.except(['csrf_token', '_csrf', 'submit'])
    const user = await userValidate(auth)
    if(!user){
        return view.render('401')
    }

    if(!req.kode){
      req.kode = await utils.GEN_KODE_BARANG(req)
    }

    try {
      await BarangHelpers.POST(req, user)
      return {
        success: true,
        message: 'Success save data...'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed save data...'
      }
    }
  }

  async show ({ auth, params, view }) {
    try {
      await auth.getUser()
      const data = await BarangHelpers.GET_ID(params)
      return view.render('master.barang.show', {data: data.toJSON()})
    } catch (error) {
        return view.render('401')
    }
  }

  async update ({ auth, params, request }) {
    const req = request.except(['csrf_token', '_csrf', 'submit'])
    const user = await userValidate(auth)
    if(!user){
        return view.render('401')
    }

    if(!req.kode){
      req.kode = await utils.GEN_KODE_BARANG(req)
    }

    try {
      await BarangHelpers.UPDATE(params, req, user)
      return {
        success: true,
        message: 'Success save data...'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed update data...'
      }
    }
  }

  async delete ({ auth, params, request }) {
    const req = request.only(['kode', 'name', 'tipe', 'email', 'phone', 'address'])
    const usr = await auth.getUser()
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()

    try {
      await BarangHelpers.DELETE(params)
      return {
        success: true,
        message: 'Success delete data...'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed delete data...'
      }
    }
  }
}

module.exports = MasBarangController

async function userValidate(auth){
  let user
  try {
      user = await auth.getUser()
      return user
  } catch (error) {
      console.log(error);
      return null
  }
}

const genKode = async (x) => {
      const kode = (x.kode).split('SUP')
      const num = parseInt(kode[1]) + 1

      const rep = '0'.repeat(4 - `${num}`.length)
      return 'SUP' + rep + num
}