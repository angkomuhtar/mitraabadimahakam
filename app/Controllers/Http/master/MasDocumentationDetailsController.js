'use strict'

const Helpers = use('Helpers')
const cryptoRandomString = require('crypto-random-string')
const MasDocumentation = use("App/Models/MasDocumentation")
const MasDocumentationDetail = use("App/Models/MasDocumentationDetail")

class MasDocumentationDetailsController {
    async index ({ view }) {
        return view.render('master.doc.fitur-details.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const masDocumentation = (
            await MasDocumentationDetail
                .query()
                .with('fitur')
                .where('aktif', 'Y')
                .paginate(halaman, limit)
        ).toJSON()
        console.log(masDocumentation);
        return view.render('master.doc.fitur-details.list', {list: masDocumentation})
    }

    async create ({ view }) {
        return view.render('master.doc.fitur-details.create')
    }

    async show ({ params, view }) {
        const doc = (await MasDocumentationDetail.query().with('fitur').where('id', params.id).last()).toJSON()
        console.log(doc);
        return view.render('master.doc.fitur-details.show', {data: doc})
    }

    async store ({ request }) {
        let req = request.only(['platform', 'fitur', 'title', 'teks', 'urut'])
        const host = request.headers().origin
        const validatePhoto = {
            types: ["image"],
            size: "20mb",
            extname: ["jpg", "jpeg", "png"],
        }

        const photo = request.file("photo", validatePhoto)
        let uriImages = null
        if(photo){
            const randURL = await cryptoRandomString({length: 30, type: 'url-safe'})
            const aliasName = `${randURL}.${photo.subtype}`
            uriImages = host + '/images/docs/'+aliasName
            await photo.move(Helpers.publicPath(`/images/docs/`), {
                name: aliasName,
                overwrite: true,
            })
    
            if (!photo.moved()) {
                return photo.error()
            }
        }

        const masDocumentationDetail = new MasDocumentationDetail()
        try {
            masDocumentationDetail.fill({
                fitur_id: req.fitur,
                title: req.title,
                teks: req.teks,
                urut: req.urut,
                img_doc: uriImages
            })
            await masDocumentationDetail.save()
            return {
                success: true,
                message: 'Success insert data...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Failed insert data...'
            }
        }
    }

    async update ({ params, request, view }) {
        const req = request.only(['fitur_id', 'title', 'teks', 'urut'])
        const host = request.headers().origin
        const validatePhoto = {
            types: ["image"],
            size: "20mb",
            extname: ["jpg", "jpeg", "png"],
        }

        const photo = request.file("photo", validatePhoto)
        if(photo){
            const randURL = await cryptoRandomString({length: 30, type: 'url-safe'})
            const aliasName = `${randURL}.${photo.subtype}`
            req.img_doc = host + '/images/docs/'+aliasName
            await photo.move(Helpers.publicPath(`/images/docs/`), {
                name: aliasName,
                overwrite: true,
            })
    
            if (!photo.moved()) {
                return photo.error()
            }
        }

        let masDocumentationDetail = await MasDocumentationDetail.find(params.id)
        try {
            masDocumentationDetail.merge(req)
            await masDocumentationDetail.save()
            return {
                success: true,
                message: 'Success update data...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Failed update data...'
            }
        }
    }

    async destroy ({ params }) {
        const data = await MasDocumentationDetail.find(params.id)
        try {
            await data.delete()
            return {
                success: true,
                message: 'Success delete data...'
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'Failed delete data...'
            }
        }
    }
}

module.exports = MasDocumentationDetailsController
