'use strict'

const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")

const Fleet = use('App/Models/MasFleet')

class MasFleetController {
    async index ({ view }) {
        return view.render('master.fleet.index')
    }

    async list ({ request, view }) {
        const req = request.only(['keyword', 'page'])
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let data
        if(req.keyword != ''){
        data = await Fleet.query().where(whe => {
            whe.where('kode', 'like', `%${req.keyword}%`)
            whe.orWhere('name', 'like', `%${req.keyword}%`)
        }).andWhere('status', 'Y')
        .paginate(halaman, limit)
        }else{
        data = await Fleet.query().where('status', 'Y').paginate(halaman, limit)
        }
        // console.log(data);
        return view.render('master.fleet.list', {list: data.toJSON()})
    }

    async store ({ auth, request }) {
        const req = request.only(['kode', 'name', 'tipe'])
        const usr = await auth.getUser()
        const fleet = new Fleet()
        fleet.fill(req)
        try {
            await fleet.save()
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

    async show ({ auth, params, request, view }) {
        const usr = await auth.getUser()
        new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
        const { id } = params
        const fleet = await Fleet.findOrFail(id)
        return view.render('master.fleet.show', {data: fleet.toJSON()})
    }

    async update ({ auth, params, request }) {
        const usr = await auth.getUser()
        const { id } = params
        const req = request.only(['kode', 'name', 'tipe'])
        const fleet = await Fleet.findOrFail(id)
        fleet.merge(req)
        try {
            await fleet.save()
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

    async delete ({ auth, params, request }) {
        const usr = await auth.getUser()
        const { id } = params
        const fleet = await Fleet.findOrFail(id)
        fleet.merge({status: 'N'})
        try {
            await fleet.save()
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
}

module.exports = MasFleetController
