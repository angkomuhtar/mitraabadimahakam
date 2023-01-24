'use strict'

const MasDocumentation = use("App/Models/MasDocumentation")

class MasDocumentationController {
    async index ({ view }) {
        return view.render('master.doc.fitur.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const masDocumentation = (await MasDocumentation.query().where('aktif', 'Y').paginate(halaman, limit)).toJSON()
        return view.render('master.doc.fitur.list', {list: masDocumentation})
    }

    async create ({ view }) {
        return view.render('master.doc.fitur.create')
    }

    async show ({ params, view }) {
        const data = (await MasDocumentation.find(params.id)).toJSON()
        return view.render('master.doc.fitur.show', {data: data})
    }

    async store ({ request }) {
        const req = request.only(['platform', 'fitur', 'desc'])
        const masDocumentation = new MasDocumentation()
        try {
            masDocumentation.fill(req)
            await masDocumentation.save()
            return {
                success: true,
                message: 'Success insert data...'
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed insert data...'
            }
        }
    }

    async update ({ params, request }) {
        const req = request.only(['platform', 'fitur', 'desc', 'urut'])
        console.log('====================================');
        console.log(params);
        console.log(req);
        console.log('====================================');
        const masDocumentation = await MasDocumentation.find(params.id)
        try {
            masDocumentation.merge(req)
            await masDocumentation.save()
            return {
                success: true,
                message: 'Success update data...'
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed update data...'
            }
        }
    }
}

module.exports = MasDocumentationController
