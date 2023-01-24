'use strict'

const DailyRitaseCoal = use('App/Models/DailyRitaseCoal')
const MasEquipmentSubcont = use('App/Models/MasEquipmentSubcont')
const DailyRitaseCoalDetail = use('App/Models/DailyRitaseCoalDetail')

class RitaseCoalDetail {
  async ALL(req) {
    const limit = req.limit || 100
    const halaman = req.page === undefined ? 1 : parseInt(req.page)
    console.log(req)
    let dailyRitaseCoalDetail
    if (req.keyword) {
      dailyRitaseCoalDetail = await DailyRitaseCoalDetail.query()
        .with('ritase_coal', a => {
          a.with('daily_fleet', aa => aa.with('pit'))
          a.with('shift')
          a.with('checker')
        })
        .with('seam')
        .with('transporter')
        .with('transporter_subcon')
        .with('opr')
        .with('opr_subcon')
        .with('checkerJT')
        .where(w => {
          w.where('kupon', 'like', `%${req.keyword}%`)
          w.orWhere('ticket', 'like', `%${req.keyword}%`)
          w.orWhere('coal_tipe', 'like', `%${req.keyword}%`)
          w.orWhere('stockpile', 'like', `%${req.keyword}%`)
          w.orWhere('keterangan', 'like', `%${req.keyword}%`)
        })
        .orderBy('created_at', 'desc')
        .paginate(halaman, limit)
    } else if (req.isFilter) {
      if (req.shift_id) {
        const arr = (await DailyRitaseCoal.query().where('shift_id', req.shift_id).fetch()).toJSON()
        dailyRitaseCoalDetail = await DailyRitaseCoalDetail.query()
          .with('ritase_coal', a => {
            a.with('daily_fleet', aa => aa.with('pit'))
            a.with('shift')
            a.with('checker')
          })
          .with('seam')
          .with('transporter')
          .with('transporter_subcon')
          .with('opr')
          .with('opr_subcon')
          .with('checkerJT')
          .where(w =>
            w.whereIn(
              'ritasecoal_id',
              arr.map(x => x.id)
            )
          )
          .orderBy('created_at', 'desc')
          .paginate(halaman, limit)
      } else if (req.subkon_id) {
        try {
          const arr = (await MasEquipmentSubcont.query().where('subcont_id', req.subkon_id).fetch()).toJSON()
          dailyRitaseCoalDetail = await DailyRitaseCoalDetail.query()
            .with('ritase_coal', a => {
              a.with('daily_fleet', aa => aa.with('pit'))
              a.with('shift')
              a.with('checker')
            })
            .with('seam')
            .with('transporter')
            .with('transporter_subcon')
            .with('opr')
            .with('opr_subcon')
            .with('checkerJT')
            .where(w => {
              w.whereIn(
                'subcondt_id',
                arr.map(x => x.id)
              )
            })
            .orderBy('created_at', 'desc')
            .paginate(halaman, limit)
        } catch (error) {
          return
        }
      } else if (req.start_checkout_jt) {
        dailyRitaseCoalDetail = await DailyRitaseCoalDetail.query()
          .with('ritase_coal', a => {
            a.with('daily_fleet', aa => aa.with('pit'))
            a.with('shift')
            a.with('checker')
          })
          .with('seam')
          .with('transporter')
          .with('transporter_subcon')
          .with('opr')
          .with('opr_subcon')
          .with('checkerJT')
          .where(w => {
            w.where('checkout_jt', '>=', req.start_checkout_jt + ' ' + '00:00:01')
            w.where('checkout_jt', '<=', req.end_checkout_jt + ' ' + '23:59:59')
          })
          .orderBy('created_at', 'desc')
          .paginate(halaman, limit)
      } else if (req.start_tiket && req.end_tiket) {
        dailyRitaseCoalDetail = await DailyRitaseCoalDetail.query()
          .with('ritase_coal', a => {
            a.with('daily_fleet', aa => aa.with('pit'))
            a.with('shift')
            a.with('checker')
          })
          .with('seam')
          .with('transporter')
          .with('transporter_subcon')
          .with('opr')
          .with('opr_subcon')
          .with('checkerJT')
          .where(w => {
            w.where('ticket', '>=', parseInt(req.start_tiket))
            w.where('ticket', '<=', parseInt(req.end_tiket))
          })
          .orderBy('created_at', 'desc')
          .paginate(halaman, limit)
      } else if (req.start_kupon && req.end_kupon) {
        dailyRitaseCoalDetail = await DailyRitaseCoalDetail.query()
          .with('ritase_coal', a => {
            a.with('daily_fleet', aa => aa.with('pit'))
            a.with('shift')
            a.with('checker')
          })
          .with('seam')
          .with('transporter')
          .with('transporter_subcon')
          .with('opr')
          .with('opr_subcon')
          .with('checkerJT')
          .where(w => {
            w.where('kupon', '>=', parseInt(req.start_kupon))
            w.where('kupon', '<=', parseInt(req.end_kupon))
          })
          .orderBy('created_at', 'desc')
          .paginate(halaman, limit)
      }
    } else {
      dailyRitaseCoalDetail = await DailyRitaseCoalDetail.query()
        .with('ritase_coal', a => {
          a.with('daily_fleet', aa => aa.with('pit'))
          a.with('shift')
          a.with('checker')
        })
        .with('seam')
        .with('transporter')
        .with('transporter_subcon')
        .with('opr')
        .with('opr_subcon')
        .with('checkerJT')
        .orderBy('created_at', 'desc')
        .paginate(halaman, limit)
    }

    return dailyRitaseCoalDetail
  }

  async GET_ID(params) {
    const dailyRitaseCoalDetail = await DailyRitaseCoalDetail.query()
      .with('ritase_coal', a => {
        a.with('daily_fleet', aa => aa.with('pit'))
        a.with('shift')
        a.with('checker')
      })
      .with('seam')
      .with('transporter')
      .with('transporter_subcon', a => a.with('subcon'))
      .with('opr')
      .with('opr_subcon', a => a.with('subcon'))
      .with('checkerJT')
      .where('id', params.id)
      .orderBy('created_at', 'desc')
      .first()
    return dailyRitaseCoalDetail
  }

  async POST(req) {
    const validTiket = await DailyRitaseCoalDetail.query().where({ kupon: req.kupon }).first()
    // if(validTiket){
    //     throw new Error('Duplicate kupon number...')
    // }

    const validID = await DailyRitaseCoal.query().where({ id: req.ritasecoal_id }).first()
    if (!validID) {
      throw new Error('Invalid ID Ritase Coal...')
    }

    try {
      const dailyRitaseCoalDetail = new DailyRitaseCoalDetail()
      dailyRitaseCoalDetail.fill(req)
      await dailyRitaseCoalDetail.save()
      return dailyRitaseCoalDetail
    } catch (error) {
      return error
    }
  }

  async UPDATE(params, req) {
    console.log(params)
    console.log(req)
    try {
      const ritaseCoalDetail = await DailyRitaseCoalDetail.find(params.id)
      ritaseCoalDetail.merge(req)
      await ritaseCoalDetail.save()
      return ritaseCoalDetail
    } catch (error) {
      console.log(error)
      return error
    }
  }

  async DELETE(params) {
    try {
      const dailyRitaseCoalDetail = await DailyRitaseCoalDetail.find(params.id)
      await dailyRitaseCoalDetail.delete()
      return dailyRitaseCoalDetail
    } catch (error) {
      return error
    }
  }
}

module.exports = new RitaseCoalDetail()
