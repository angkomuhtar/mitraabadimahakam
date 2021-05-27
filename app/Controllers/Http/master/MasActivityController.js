'use strict'

// CustomClass
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")

const Activity = use('App/Models/MasActivity')

class MasActivityController {
  async index ({ request, response, view }) {
    return view.render('master.activity.index')
  }

  async list ({ request, view }) {
    const req = request.all()
    const limit = 10
    const halaman = req.page === undefined ? 1:parseInt(req.page)
    let data
    if(req.keyword != ''){
      data = await Activity.query().where(whe => {
        whe.where('kode', 'like', `%${req.keyword}%`)
        whe.orWhere('name', 'like', `%${req.keyword}%`)
      }).andWhere('sts', 'Y')
      .paginate(halaman, limit)
    }else{
      data = await Activity.query().where('sts', 'Y').paginate(halaman, limit)
    }
    // console.log(data);
    return view.render('master.activity.list', {list: data.toJSON()})
  }

  async store ({ auth, request, response }) {
    const usr = await auth.getUser()
    const req = request.only(['kode', 'name', 'keterangan'])
    console.log(req);
    const activity = new Activity()
    activity.fill(req)
    try {
      await activity.save()
      new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
      return {
        success: true,
        message: 'Success insert data'
      }
    } catch (error) {
      console.log(error);
      new Loggerx(request.url(), request.all(), usr, request.method(), error).tempData()
      return {
        success: false,
        message: 'Failed insert data'
      }
    }
  }

  async show ({ params, request, view }) {
    const { id } = params
    const activity = await Activity.findOrFail(id)
    return view.render('master.activity.show', {data: activity.toJSON()})
  }

  async edit ({ params, request, response, view }) {
  }

  async update ({ auth, params, request }) {
    const usr = await auth.getUser()
    const { id } = params
    const req = request.only(['kode', 'name', 'keterangan'])
    const activity = await Activity.findOrFail(id)
    activity.merge(req)
    try {
      await activity.save()
      new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
      return {
        success: true,
        message: 'Success update data'
      }
    } catch (error) {
      console.log(error);
      new Loggerx(request.url(), request.all(), usr, request.method(), error).tempData()
      return {
        success: false,
        message: 'Failed update data'
      }
    }
  }

  /**
   * Delete a masactivity with id.
   * DELETE masactivities/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async delete ({ params, request, auth }) {
    const usr = await auth.getUser()
    const { id } = params
    const activity = await Activity.findOrFail(id)
    activity.merge({sts: 'N'})
    try {
      await activity.save()
      new Loggerx(request.url(), activity.toJSON(), usr, request.method(), true).tempData()
      return {
        success: true,
        message: 'Success delete data'
      }
    } catch (error) {
      console.log(error);
      new Loggerx(request.url(), request.all(), usr, request.method(), error).tempData()
      return {
        success: false,
        message: 'Failed delete data'
      }
    }
  }
}

module.exports = MasActivityController
