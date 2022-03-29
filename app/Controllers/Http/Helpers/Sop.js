'use strict'
const db = use('Database')
const MasSop = use("App/Models/MasSop")


class MstSop {
    async LIST (req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const sop = await MasSop.query().where( w  => {
            if (req.no_reg) {
                w.where('no_reg', req.no_reg)
            }
            if (req.department) {
                w.where('no_reg', req.department)
            }
            if (req.sub_sop_module) {
                w.where('sub_sop_module', 'like', `%${req.sub_sop_module}%`)
            }
        }).paginate(halaman, limit)
        
        return sop.toJSON()
    }
}

module.exports = new MstSop()