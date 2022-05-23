'use strict'
const db = use('Database')
const MasSop = use('App/Models/MasSop')

class MstSop {
  async LIST(req) {
    const limit = req.limit || 25
    const halaman = req.page === undefined ? 1 : parseInt(req.page)
    const sop = await MasSop.query()
      .where(w => {
        if (req.no_reg) {
          w.where('no_reg', req.no_reg)
        }
        if (req.department) {
          w.where('department', req.department)
        }
        if (req.sub_sop_module) {
          w.where('sub_sop_module', 'like', `%${req.sub_sop_module}%`)
        }
      })
      .paginate(halaman, limit)
    return sop.toJSON()
  }

  async uploadNewSOP(req) {
    const { date, no_regist, dept, sts_in, sts_approve, sts_out, approved_date, currentFileName } = req

    const fileName = currentFileName && JSON.parse(currentFileName);
  }
}

module.exports = new MstSop()
