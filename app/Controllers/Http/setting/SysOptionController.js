'use strict'

const SysOption = use("App/Models/SysOption")

class SysOptionController {
    async index ({ auth, view, request }) {
        const req = request.all()
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let data
        if(!req.keyword){
            data = (
                await SysOption.query()
                    .where('status', 'Y')
                    .orderBy([{ column: 'group', order: 'asc' }, { column: 'urut', order: 'desc' }])
                    .paginate(halaman, limit)
            ).toJSON()
        }
        // console.log('data______ ', data)
        return view.render('setting.sys-options.index', {list: data})
    }

    async list ({ auth, view, request }) {
        const req = request.all()
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let data
        if(!req.keyword){
            data = (
                await SysOption.query()
                    .where('status', 'Y')
                    .orderBy([{ column: 'group', order: 'asc' }, { column: 'urut', order: 'desc' }])
                    .paginate(halaman, limit)
            ).toJSON()
        }
        // console.log('data______ ', data)
        return view.render('setting.sys-options.list', {list: data})
    }

    async create ({ auth, request }) {
        const usr = await auth.getUser()
        const req = request.only(['group', 'teks', 'nilai'])

        const options = new SysOption()
        options.fill(req)
        try {
            await options.save()
            return {
                success: true,
                message: 'Insert data success...'
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Insert data failed...'
            }
        }
    }

    async show ({params, view}) {
        const collection = (await SysOption.findOrFail(params.id)).toJSON()
        console.log(collection)
        return view.render('setting.sys-options.show', {data: collection})
    }

    async update ({ params, request }) {
        const { id } = params
        const req = request.only(['group', 'teks', 'nilai', 'status'])
        const collection = await SysOption.findOrFail(id)
        collection.merge(req)
        try {
            await collection.save()
            return {
                success: true,
                message: 'Update data success...!'
            }
        } catch (error) {
            return {
                success: false,
                message: 'Update data failed...!'
            }
        }
    }
}

module.exports = SysOptionController
