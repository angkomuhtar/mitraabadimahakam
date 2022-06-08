'use strict'

const _ = require('underscore')
const db = use('Database')
const moment = require('moment')
const MasPit = use('App/Models/MasPit')
const MasFleet = use('App/Models/MasFleet')
const MasShift = use('App/Models/MasShift')
const MasSeam = use('App/Models/MasSeam')
const MasEquipment = use('App/Models/MasEquipment')
// const MonthlyPlan = use("App/Models/MonthlyPlan")
const DailyPlan = use('App/Models/DailyPlan')
const DailyFleet = use('App/Models/DailyFleet')
const DailyFleetEquip = use('App/Models/DailyFleetEquip')
const UnitSubcont = use('App/Models/MasEquipmentSubcont')
const DailyRitaseCoal = use('App/Models/DailyRitaseCoal')
const DailyRitaseCoalDetail = use('App/Models/DailyRitaseCoalDetail')
const DailyRitaseCoalHelpers = use('App/Controllers/Http/Helpers/DailyRitaseCoal')
const DailyRitaseCoalDeatilHelpers = use('App/Controllers/Http/Helpers/DailyRitaseCoalDetail')
const Helpers = use('Helpers')
const excelToJson = require('convert-excel-to-json')
const { uid } = require('uid')

let aliasName

class DailyRitaseCoalController {
  async index({ view }) {
    return view.render('operation.daily-ritase-coal.index')
  }

  async list({ request, view }) {
    const req = request.all()

    let data = []
    try {
      data = await DailyRitaseCoalDeatilHelpers.ALL(req)
    } catch (error) {
      console.log(error)
    }
    return view.render('operation.daily-ritase-coal.list', {
      limit: req.limit || 100,
      list: data.toJSON(),
    })
  }

  async create({ view }) {
    return view.render('operation.daily-ritase-coal.create')
  }

  async fileValidate({ auth, request }) {
    try {
      await auth.getUser()
    } catch (error) {
      return {
        success: false,
        message: 'you not authorized....',
      }
    }

    var req = request.all()
    const validateFile = {
      types: ['xls', 'xlsx'],
      size: '2mb',
      types: 'application',
    }

    const uploadData = request.file('uploadfiles', validateFile)

    if (uploadData) {
      aliasName = req.model === 'radioroom' ? `upload-radioroom-${moment().format('DDMMYYHHmmss')}.${uploadData.extname}` : `upload-jetty-${moment().format('DDMMYYHHmmss')}.${uploadData.extname}`

      await uploadData.move(Helpers.publicPath(`/upload/`), {
        name: aliasName,
        overwrite: true,
      })

      if (!uploadData.moved()) {
        return uploadData.error()
      }

      var pathData = Helpers.publicPath(`/upload/`)

      const convertJSON = excelToJson({
        sourceFile: `${pathData}${aliasName}`,
        header: {
          rows: req.model === 'radioroom' ? 1 : 3,
        },
      })

      var arr = Object.keys(convertJSON).map(function (key) {
        return key
      })

      return {
        title: arr,
        data: convertJSON,
      }
    }
  }

  async store({ auth, request }) {
    let usr
    let exca_id
    let dailyFleet
    let dailyRitaseCoal
    const req = request.all()
    const trx = await db.beginTransaction()

    try {
      usr = await auth.getUser()
    } catch (error) {
      return {
        success: false,
        message: 'you not authorized....',
      }
    }

    let data = JSON.parse(req.jsonData)

    let parsing = Object.keys(data).map(function (key) {
      return {
        nm_sheet: key,
        details: data[key],
      }
    })

    /* Generate Filter Object */
    const [selectSheet] = parsing.filter(function (obj) {
      return obj.nm_sheet === req.nm_sheet
    })

    if (req.model === 'radioroom') {
      let dataRadioRoom = []
      let dailyFleet = null
      for (const obj of selectSheet.details) {
        // console.log(obj);
        var datez = moment(req.date).format('YYYY-MM-DD')
        var datetime = moment(datez + ' ' + obj.B.replace('.', ':')).format('YYYY-MM-DD HH:mm')
        console.log('req date >> ', datetime)
        const dt_subcon = await UnitSubcont.query().where('kode', obj.D).last()
        const pit = (await MasPit.query().with('site').where('kode', obj.G).andWhere('sts', 'Y').last()).toJSON()
        const shift = await MasShift.query().where('kode', obj.F).last()
        const exca = await MasEquipment.query().where('kode', obj.C.replace(' ', '')).last()

        console.log('exca >> ', exca)
        console.log('seam >> ', obj.I)

        const seam = await MasSeam.query()
          .where(w => {
            w.where('pit_id', pit.id)
            w.where('kode', obj.I)
          })
          .last()

        const fleet = await MasFleet.query()
          .where(w => {
            w.where('pit_id', pit.id)
            w.where('tipe', 'CO')
            w.where('status', 'Y')
          })
          .last()

        if (!dt_subcon) {
          return {
            success: false,
            data: null,
            message: 'Dump Truck ' + obj.D + ' tidak di temukan...',
          }
        }
        if (!exca) {
          return {
            success: false,
            data: null,
            message: 'Equipment unit ' + obj.C + ' tidak di temukan...',
          }
        }
        if (!pit) {
          return {
            success: false,
            data: null,
            message: 'Data PIT ' + obj.G + ' tidak di temukan...',
          }
        }
        if (!fleet) {
          return {
            success: false,
            data: null,
            message: 'Data fleet tidak di temukan...',
          }
        }
        if (!seam) {
          return {
            success: false,
            data: null,
            message: 'Data seam tidak di temukan...',
          }
        }

        // console.log('....', exca.id);

        /* CREATE OR USED DAILY FLEET */
        let dailyFleetEquip = await DailyFleetEquip.query()
          .where(w => {
            w.where('equip_id', exca.id)
            w.where('datetime', '>=', moment(req.date).startOf('day').format('YYYY-MM-DD HH:mm'))
            w.where('datetime', '<=', moment(req.date).endOf('day').format('YYYY-MM-DD HH:mm'))
          })
          .last()

        console.log(dailyFleetEquip);

        if (!dailyFleetEquip) {
          dailyFleet = new DailyFleet()
          dailyFleet.fill({
            fleet_id: fleet.id,
            pit_id: pit.id,
            activity_id: 8,
            date: req.date,
            shift_id: shift.id,
            user_id: usr.id,
            tipe: 'MF',
          })
          try {
            await dailyFleet.save()
          } catch (error) {
            console.log(error)
          }

          dailyFleetEquip = new DailyFleetEquip()
          dailyFleetEquip.fill({
            dailyfleet_id: dailyFleet.id,
            equip_id: exca.id,
            datetime: moment(req.date).format('YYYY-MM-DD HH:mm'),
          })
          try {
            await dailyFleetEquip.save()
          } catch (error) {
            console.log(error)
          }
        } else {
          dailyFleet = await DailyFleet.query()
            .where(w => {
              w.where('pit_id', pit.id)
              w.where('activity_id', 8)
              w.where('shift_id', shift.id)
              w.where('date', moment(req.date).format('YYYY-MM-DD'))
            })
            .last()
        }

        /* CREATE DAILY RITASE COAL */
        dataRadioRoom.push({
          checkout_pit: datetime,
          subcondt_id: dt_subcon.id,
          dailyfleet_id: dailyFleet.id,
          pit_id: pit.id,
          site_id: pit.site.id,
          exca_id: exca.id,
          shift_id: shift.id,
          distance: pit.jarak_jetty,
          volume: parseFloat(obj.E),
          kupon: obj.H || null,
          seam_id: seam.id,
          stockpile: obj.K,
          coal_tipe: obj.L,
          datetime: datetime,
        })
      }

      dataRadioRoom = _.groupBy(dataRadioRoom, 'dailyfleet_id')
      dataRadioRoom = Object.keys(dataRadioRoom).map(key => {
        return {
          dailyfleet_id: key,
          items: dataRadioRoom[key],
        }
      })

      let dailyRitaseCoal = null
      for (const obj of dataRadioRoom) {
        // console.log(obj);
        // var datez = moment(req.date).format('YYYY-MM-DD')
        // var datetime = moment(datez + ' ' + (obj.timez).replace('.', ':')).format('YYYY-MM-DD HH:mm')

        var tot_volum = obj.items.reduce((a, b) => {
          return a + b.volume
        }, 0)

        var dailyfleet = await DailyFleet.query().where('id', obj.dailyfleet_id).last()
        var pit = (await MasPit.query().with('site').where('id', dailyfleet.pit_id).last()).toJSON()

        dailyRitaseCoal = await DailyRitaseCoal.query()
          .where(w => {
            w.where('dailyfleet_id', obj.dailyfleet_id)
            w.where('pit_id', dailyfleet.pit_id)
            w.where('date', '>=', moment(obj.datetime).startOf('day').format('YYYY-MM-DD HH:mm'))
            w.where('date', '<=', moment(obj.datetime).endOf('day').format('YYYY-MM-DD HH:mm'))
          })
          .last()

        if (!dailyRitaseCoal) {
          dailyRitaseCoal = new DailyRitaseCoal()
          dailyRitaseCoal.fill({
            dailyfleet_id: obj.dailyfleet_id,
            site_id: pit.site.id,
            pit_id: dailyfleet.pit_id,
            exca_id: obj.items[0].exca_id,
            shift_id: dailyfleet.shift_id,
            distance: pit.jarak_jetty,
            block: 'XX',
            sum_vol: tot_volum,
            tw_netto: tot_volum,
            coal_rit: obj.items.length,
            checker_id: usr.id,
            date: req.date,
          })
        } else {
          dailyRitaseCoal.merge({
            checker_id: usr.id,
            sum_vol: dailyRitaseCoal.sum_vol + tot_volum,
            coal_rit: obj.items.length,
            tw_netto: dailyRitaseCoal.sum_vol + tot_volum,
          })
        }

        /* INSERT DAILY RITASE COAL */
        try {
          await dailyRitaseCoal.save()
        } catch (error) {
          console.log(error)
          // await trx.rollback()
          return {
            success: false,
            message: 'failed save ritase coal...',
          }
        }

        /* UPDATE DAILY PLAN COAL */
        let coalPlan = await DailyPlan.query()
          .where(w => {
            w.where('pit_id', dailyRitaseCoal.pit_id)
            w.where('tipe', 'COAL')
            w.where('current_date', moment(obj.datetime).format('YYYY-MM-DD'))
          })
          .last()

        if (!coalPlan) {
          return {
            success: false,
            message: 'failed get daily plan...',
          }
        }
        try {
          coalPlan.merge({
            actual: tot_volum,
          })
          await coalPlan.save()
        } catch (error) {
          console.log(error)
          // await trx.rollback()
          return {
            success: false,
            message: 'failed save daily plan coal...',
          }
        }

        /** GET LAST NO KUPON */
        let getLastNoKupon = await DailyRitaseCoalDetail.query().last()
        if (getLastNoKupon) {
          getLastNoKupon = getLastNoKupon.toJSON()
        }

        /* INSERT RITASE COAL DETAILS */
        for (const elm of obj.items) {
          let dailyRitaseCoalDetail = new DailyRitaseCoalDetail()
          dailyRitaseCoalDetail.fill({
            ritasecoal_id: dailyRitaseCoal.id,
            subcondt_id: elm.subcondt_id,
            checkout_pit: elm.checkout_pit,
            tr_vol: elm.volume,
            kupon: elm.kupon ? elm.kupon : uid(7),
            coal_tipe: elm.coal_tipe || null,
            stockpile: elm.stockpile || null,
            seam_id: elm.seam_id || null,
            keterangan: 'data volume by truck count... | no.kupon generated by code',
          })

          try {
            await dailyRitaseCoalDetail.save()
          } catch (error) {
            console.log(error)
            // await trx.rollback()
            return {
              success: false,
              message: 'failed save ritase coal details...',
            }
          }
        }
      }
      await trx.commit()
      return {
        success: true,
        message: 'success save ritase coal...',
      }
    } else {
      let genData = selectSheet.details
        .filter(item => item.O > 0 && moment(item.F).add(1, 'minutes').format('YYYY-MM-DD') === req.date)
        .map(item => {
          if (item.E) {
            var date = moment(item.F).add(1, 'minutes').format('YYYY-MM-DD')
            var parsingSeam = item.L.split('.').length > 1 ? item.L.split('.')[1] : item.L.split('.')[0].replace(/\s/g, '')
            return {
              checker_jt: usr.id,
              shift_id: item.E,
              date: date,
              checkout_pit: date + ' ' + '00:00',
              checkin_jt: date + ' ' + moment(item.H).add(3, 'minutes').format('HH:mm'),
              checkout_jt: date + ' ' + moment(item.I).add(3, 'minutes').format('HH:mm'),
              no_kupon: item.J,
              ticket: item.Q,
              seam_id: parsingSeam,
              subcondt_id: item.K,
              w_gross: item.M * 1000,
              w_tare: item.N * 1000,
              w_netto: item.O * 1000,
              block: parseInt(item.P.replace('BL.', '')),
            }
          }
        })

      /* Check Data tiket is not NULL */
      for (const [i, obj] of genData.entries()) {
        if (obj.ticket === undefined) {
          return {
            success: false,
            message: 'Data kupon ' + obj.no_kupon + ' tdk memiliki nomor tiket...',
          }
        }
      }

      for (const obj of genData) {
        console.log('====================================')
        console.log({
          pit_id: req.pit_id,
          fleet_id: req.fleet_id,
          shift_id: obj.shift_id,
          date: req.date,
          activity_id: 8,
        })
        console.log('====================================')
        dailyFleet = await DailyFleet.query()
          .where({
            pit_id: req.pit_id,
            fleet_id: req.fleet_id,
            shift_id: obj.shift_id,
            date: req.date,
            activity_id: 8,
          })
          .last()

        if (!dailyFleet) {
          return {
            data: {
              pit_id: req.pit_id,
              fleet_id: req.fleet_id,
              shift_id: obj.shift_id,
              date: req.date,
              activity_id: 8,
            },
            success: false,
            message: 'Daily Fleet utk hauling coal tidak ditemukan...',
          }
        }
      }

      /* Validate Undefined UNIT DT  & Daily Ritase Coal */
      for (const obj of genData) {
        const unitDT = await UnitSubcont.query().where('kode', 'like', `${obj.subcondt_id}`).last()
        if (!unitDT) {
          return {
            success: false,
            message: 'Unit DT ' + obj.subcondt_id + ' tidak di temukan...',
          }
        }
      }

      /* Grouping Object By Shift */
      let groupShift = genData.reduce((r, a) => {
        r[a.shift_id] = [...(r[a.shift_id] || []), a]
        return r
      }, {})

      /* Generate Object By Block */
      function GROUPING_BLOCK(data) {
        const grp = data.reduce((r, a) => {
          r[a.block] = [...(r[a.block] || []), a]
          return r
        }, {})
        return Object.keys(grp).map(function (key) {
          return {
            block: key,
            details: grp[key],
          }
        })
      }

      /* Generate Valid Object */
      let parsingShift = Object.keys(groupShift).map(function (key) {
        var shiftDetails = groupShift[key]
        return {
          shift_id: key,
          data: GROUPING_BLOCK(shiftDetails),
        }
      })

      try {
        for (const obj of parsingShift) {
          var shift = obj.shift_id

          for (const item of obj.data) {
            /* Cari ID Unit Excavator */
            const unitExcavator = (await DailyFleetEquip.query().with('equipment').where('dailyfleet_id', dailyFleet.id).fetch()).toJSON()

            const [excavator] = unitExcavator.filter(obj => obj.equipment.tipe === 'excavator')

            exca_id = excavator.equipment.id

            dailyRitaseCoal = await DailyRitaseCoal.query()
              .where(w => {
                w.where('shift_id', shift)
                w.where('block', item.block)
                w.where('date', '>=', req.date + ' ' + '00:00:01')
                w.where('date', '<=', req.date + ' ' + '23:59:59')
              })
              .last()

            if (!dailyRitaseCoal) {
              dailyRitaseCoal = new DailyRitaseCoal()
              dailyRitaseCoal.fill({
                distance: 23,
                dailyfleet_id: dailyFleet.id,
                exca_id: exca_id,
                checker_id: usr.id,
                shift_id: shift,
                block: item.block,
                date: req.date + ' ' + '00:00:01',
              })
              try {
                await dailyRitaseCoal.save()
              } catch (error) {
                console.log(error)
                return {
                  success: false,
                  message: 'Save data daily ritase coal failed....',
                }
              }
            }

            for (const val of item.details) {
              const unitDT = (await UnitSubcont.query().where('kode', 'like', `${val.subcondt_id}`).last()).toJSON()

              let seam
              try {
                seam = (
                  await MasSeam.query()
                    .where(w => {
                      w.where('kode', val.seam_id)
                      w.where('pit_id', req.pit_id)
                    })
                    .last()
                ).toJSON()
              } catch (error) {
                console.log(error)
                return {
                  success: false,
                  message: 'Kode Seam ' + val.seam_id + ' tdk ditemukan....',
                }
              }

              const formatKupon = '0'.repeat(7 - `${val.no_kupon}`.length) + val.no_kupon

              const detailUpload = {
                ritasecoal_id: dailyRitaseCoal.id,
                kupon: formatKupon,
                ticket: val.ticket,
                seam_id: seam.id,
                subcondt_id: unitDT.id,
                // subcondt_id: unitDT.subcont_id,
                checkout_pit: val.checkout_pit,
                checkin_jt: val.checkin_jt,
                checkout_jt: val.checkout_jt,
                w_gross: val.w_gross,
                w_tare: val.w_tare,
                w_netto: val.w_netto,
                checker_jt: usr.id,
              }

              let dailyRitaseCoalDetail

              dailyRitaseCoalDetail = await DailyRitaseCoalDetail.query()
                .where(w => {
                  w.where('ritasecoal_id', dailyRitaseCoal.id)
                  w.where('ticket', val.ticket)
                  w.where('kupon', formatKupon)
                })
                .first()

              if (!dailyRitaseCoalDetail) {
                dailyRitaseCoalDetail = new DailyRitaseCoalDetail()
                dailyRitaseCoalDetail.fill({
                  ...detailUpload,
                  keterangan: 'Upload file excel....',
                })
                await dailyRitaseCoalDetail.save()
              } else {
                dailyRitaseCoalDetail.merge({
                  ...detailUpload,
                  keterangan: 'ReUpload excel file datetime ' + moment().format('DD-MM-YYYY HH:mm:ss') + ' By ' + usr.nm_lengkap,
                })
                await dailyRitaseCoalDetail.save()
              }
            }
          }
        }
        return {
          success: true,
          data: genData,
          message: 'Upload data ritase coal success....',
        }
      } catch (error) {
        console.log(error)
        return {
          success: false,
          data: error,
          message: 'Upload data ritase coal success....',
        }
      }
    }
  }

  async show({ params, view }) {
    console.log(params)
    let data = {}
    try {
      data = await DailyRitaseCoalDeatilHelpers.GET_ID(params)
      console.log(data.toJSON())
    } catch (error) {
      console.log(error)
    }
    return view.render('operation.daily-ritase-coal.show', { data: data.toJSON() })
  }

  async view({ params, view }) {
    console.log(params)
    let data = {}
    try {
      data = await DailyRitaseCoalDeatilHelpers.GET_ID(params)
      console.log(data.toJSON())
    } catch (error) {
      console.log(error)
    }
    return view.render('operation.daily-ritase-coal.view', { data: data.toJSON() })
  }

  async update({ auth, params, request }) {
    const req = request.only(['checkin_jt', 'checkout_jt', 'ticket', 'stockpile', 'coal_tipe', 'w_gross', 'w_tare', 'w_netto', 'keterangan'])
    const usr = await auth.getUser()
    req.checker_jt = usr.id
    req.stockpile = req.stockpile.toUpperCase()
    try {
      const data = await DailyRitaseCoalDeatilHelpers.UPDATE(params, req)
      // console.log(data.toJSON());
      return {
        success: true,
        message: 'Ritase Coal success akumulated...',
      }
    } catch (error) {
      console.log(error)
      return {
        success: false,
        message: error.message,
      }
    }
  }
}

module.exports = DailyRitaseCoalController
