'use strict'

const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")
const Eventhelpers = use("App/Controllers/Http/Helpers/Event")

class MasEventController {
    async index ({ view }) {
        return view.render('master.event.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        const data = (await Eventhelpers.ALL_(req)).toJSON()
        console.log(data);
        return view.render('master.event.list', {list: data, keyword: req.keyword})
    }

    async create ({ view }) {
        return view.render('master.event.create')
    }

    async show ({ params, view }) {
        const data = (await Eventhelpers.SHOW(params)).toJSON()
        return view.render('master.event.show', {data: data})
    }

    async store ({ auth, request }) {
        const req = request.only(['kode', 'narasi', 'satuan', 'status'])
        const usr = await auth.getUser()
        
        try {
            await Eventhelpers.POST(req)
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

    async update ({ auth, params, request }) {
        const req = request.only(['kode', 'narasi', 'satuan', 'status'])
        const usr = await auth.getUser()
        
        try {
            await Eventhelpers.UPDATE(params, req)
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

    async delete ({ auth, params }) {
        const usr = await auth.getUser()
        if(usr.user_tipe === 'administrator'){
            try {
                await Eventhelpers.DELETE(params)
                return {
                  success: true,
                  message: 'Success delete data'
                }
            } catch (error) {
                console.log(error);
                return {
                  success: false,
                  message: 'Failed delete data'
                }
            }
        }else{
            return {
                success: false,
                message: 'User not authorized delete data....'
              }
        }
    }
    async getAllEvents({ params, request, auth }) {
        const site = await Site.query().where('status', 'Y').fetch()
        return {
          data: site.toJSON(),
        }
      }
    
}

module.exports = MasEventController
