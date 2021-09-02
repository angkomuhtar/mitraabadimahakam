'use strict'

const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")
const SupplierHelpers = use("App/Controllers/Http/Helpers/Supplier")

class MasSupplierController {
  async index ({ auth, request, response, view }) {
    const usr = await auth.getUser()
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    return view.render('master.supplier.index')
  }

  async list ({ request, view }) {
    const req = request.all()
    try {
      const data = await SupplierHelpers.ALL(req)
      return view.render('master.supplier.list', {list: data.toJSON()})
    } catch (error) {
      return view.render('404')
    }
  }

  async create ({ auth, request, view }) {
    const usr = await auth.getUser()
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    const data = await SupplierHelpers.GET_LAST()

    let kode
    if(data){
      kode = await genKode(data)
    }else{
      kode = 'SUP0001'
    }
    console.log('DATA --------:::', kode);
    return view.render('master.supplier.create', {kode: kode})
  }

  async store ({ auth, request }) {
    const req = request.only(['kode', 'name', 'tipe', 'email', 'phone', 'address'])
    const usr = await auth.getUser()
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    
    try {
      await SupplierHelpers.POST(req)
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
      const data = await SupplierHelpers.GET_ID(params)
      return view.render('master.supplier.show', {data: data.toJSON()})
    } catch (error) {
        return view.render('401')
    }
  }

  async update ({ auth, params, request }) {
    const req = request.only(['kode', 'name', 'tipe', 'email', 'phone', 'address'])
    const usr = await auth.getUser()
    new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()

    const duplicateKode = await SupplierHelpers.CHECK_KODE(req)
    try {
      if(!duplicateKode){
        await SupplierHelpers.UPDATE(params, req)
        return {
          success: true,
          message: 'Success save data...'
        }
      }else{
        return {
          success: false,
          message: 'Duplicated kode supplier...'
        }
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
      await SupplierHelpers.DELETE(params)
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

module.exports = MasSupplierController


const genKode = async (x) => {
      const kode = (x.kode).split('SUP')
      const num = parseInt(kode[1]) + 1

      const rep = '0'.repeat(4 - `${num}`.length)
      return 'SUP' + rep + num
}