'use strict'

const DB = use('Database')
const _ = require('underscore')
const RefuelUnitHelpers = use('App/Controllers/Http/Helpers/Fuel')
const MasEquipment = use('App/Models/MasEquipment')
const MasPit = use('App/Models/MasPit')
const DailyRefueling = use('App/Models/DailyRefueling')
const Helpers = use('Helpers')
const moment = require('moment')
const excelToJson = require('convert-excel-to-json')
const NotificationsHelpers = use(
     'App/Controllers/Http/Helpers/Notifications'
)

class DailyRefuelEquipmentController {
     async index({ auth, view }) {
          return view.render('operation.daily-refuel-unit.index')
     }

     async list({ request, view }) {
          const req = request.all()
          const data = await RefuelUnitHelpers.LIST_REFUEL_UNIT(req)
          // return data
          return view.render('operation.daily-refuel-unit.list', {
               list: data.toJSON(),
          })
     }

     async create({ auth, view }) {
          let usr
          try {
               usr = await auth.getUser()
          } catch (error) {
               return view.render('404')
          }

          const fuelTruck = (
               await MasEquipment.query()
                    .where('tipe', 'fuel truck')
                    .fetch()
          ).toJSON()
          let dataFT = []
          for (let i = 0; i < fuelTruck.length; i++) {
               dataFT.push({
                    kode: fuelTruck[i].kode,
                    brand: fuelTruck[i].brand,
                    unit_sn: fuelTruck[i].unit_sn,
                    shift_id: 1,
               })
          }

          for (let i = 0; i < fuelTruck.length; i++) {
               dataFT.push({
                    kode: fuelTruck[i].kode,
                    brand: fuelTruck[i].brand,
                    unit_sn: fuelTruck[i].unit_sn,
                    shift_id: 2,
               })
          }

          return view.render('operation.daily-refuel-unit.create', {
               fuelTruck: dataFT,
          })
     }

     async uploadFile({ auth, request }) {
          const validateFile = {
               types: ['xls', 'xlsx'],
               size: '2mb',
               types: 'application',
          }
          const reqFile = request.file('refuel_xls', validateFile)
          console.log(reqFile)

          let aliasName
          if (reqFile) {
               aliasName = `refuel-unit-${moment().format(
                    'DDMMYYHHmmss'
               )}.${reqFile.extname}`

               await reqFile.move(Helpers.publicPath(`/upload/`), {
                    name: aliasName,
                    overwrite: true,
               })

               if (!reqFile.moved()) {
                    return reqFile.error()
               }

               var pathData = Helpers.publicPath(`/upload/`)

               const convertJSON = excelToJson({
                    sourceFile: `${pathData}${aliasName}`,
                    header: {
                         rows: 4,
                    },
               })

               var arr = Object.keys(convertJSON).map(function (key) {
                    return key
               })

               return {
                    title: arr,
                    data: convertJSON,
               }
          } else {
               return {
                    title: ['No File Upload'],
                    data: [],
               }
          }
     }

     async store({ auth, request }) {
          const usr = await auth.getUser()
          const req = request.only([
               'tgl',
               'site_id',
               'sheet',
               'dataJson',
          ])
          const reqArr = request.collect([
               'ft_name',
               'shift_id',
               'fm_awal',
               'fm_akhir',
          ])
          console.log(reqArr)
          let xlsJSON = JSON.parse(req.dataJson)

          xlsJSON = Object.keys(xlsJSON).map(key => {
               return {
                    sheet: key,
                    data: xlsJSON[key],
               }
          })

          const [data] = xlsJSON.filter(
               sht => sht.sheet === req.sheet
          )

          const initData = data.data.filter(u => u.C)

          let parsingData = []
          let limitData

          for (const [idx, EL] of initData.entries()) {
               if (EL.B === 'Stock :') {
                    limitData = idx + 1
               }
          }

          for (let i = 0; i < limitData; i++) {
               if (initData[i].G && initData[i].H === undefined) {
                    return {
                         success: false,
                         message:
                              'Ditemukan pengisian fuel unit ' +
                              initData[i].C +
                              ' yang tdk ditentukan fuel truck nya...',
                    }
                    // throw new Error('Ditemukan pengisian fuel unit ' + initData[i].C + ' yang tdk ditentukan fuel truck nya...')
               }

               if (initData[i].L && initData[i].M === undefined) {
                    return {
                         success: false,
                         message:
                              'Ditemukan pengisian fuel unit ' +
                              initData[i].C +
                              ' yang tdk ditentukan fuel truck nya...',
                    }
                    // throw new Error('Ditemukan pengisian fuel unit ' + initData[i].C + ' yang tdk ditentukan fuel truck nya...')
               }
          }

          for (let i = 0; i < limitData; i++) {
               let dayShift
               let nightShift
               if (initData[i].F && initData[i].G) {
                    dayShift = {
                         pit_name: initData[i].D || null,
                         fueling_at: initData[i].E
                              ? moment(initData[i].E).format('HH:mm')
                              : null,
                         shift_id: 1,
                         hm: initData[i].F ? initData[i].F : null,
                         topup: initData[i].G ? initData[i].G : 0,
                         fuel_truck: initData[i].H
                              ? initData[i].H
                              : null,
                    }
               } else {
                    dayShift = null
               }

               if (initData[i].K && initData[i].L) {
                    nightShift = {
                         pit_name: initData[i].I || null,
                         fueling_at: initData[i].J
                              ? moment(initData[i].J).format('HH:mm')
                              : null,
                         shift_id: 2,
                         hm: initData[i].K ? initData[i].K : null,
                         topup: initData[i].L ? initData[i].L : 0,
                         fuel_truck: initData[i].M
                              ? initData[i].M
                              : null,
                    }
               } else {
                    nightShift = null
               }

               parsingData.push({
                    kode: initData[i].C,
                    description: initData[i].O || null,
                    details: [dayShift, nightShift],
               })
          }

          let datax = []

          for (const obj of parsingData) {
               for (const val of obj.details) {
                    if (val) {
                         datax.push({
                              description: obj.description,
                              kode: obj.kode,
                              fueling_at:
                                   val.fueling_at || new Date(),
                              fuel_truck: val.fuel_truck,
                              hm: val.hm,
                              shift_id: val.shift_id,
                              topup: val.topup,
                              pit_name: val.pit_name,
                         })
                    }
               }
          }

          datax = datax.map(c => {
               const [tmp] = _.where(reqArr, {
                    ft_name: c.fuel_truck,
                    shift_id: `${c.shift_id}`,
               })
               return {
                    ...c,
                    // fueling_at: c.fueling_at ? req.tgl +' '+ c.fueling_at : moment(req.tgl).format('YYYY-MM-DD HH:mm'),
                    ft_awal: tmp ? tmp.fm_awal : 0,
                    ft_akhir: tmp ? tmp.fm_akhir : 0,
               }
          })

          datax = datax.filter(e => e.topup > 0 && e.fuel_truck)
          /** ADD OBJECT DAILY FUELING **/
          for (const obj of datax) {
               const unit = await MasEquipment.query()
                    .where('kode', obj.kode)
                    .last()

               const fuel_truck = await MasEquipment.query()
                    .where(w => {
                         w.where('kode', obj.fuel_truck)
                    })
                    .last()

               if (!fuel_truck) {
                    throw new Error(
                         obj.fuel_truck +
                              ' tidak ditemukan dalam database system...'
                    )
               }

               const pit = await MasPit.query()
                    .where(w => {
                         w.where('sts', 'Y')
                         w.where('name', 'like', `${obj.pit_name}%`)
                    })
                    .last()

               if (obj.fueling_at === 'Invalid date') {
                    return {
                         success: false,
                         message:
                              'Format waktu tidak valid utk unit ' +
                              obj.kode +
                              ' Silahkan periksa kembali excel anda...',
                    }
               }

               const addData = {
                    description: obj.description,
                    site_id: req.site_id,
                    pit_id: pit?.id || null,
                    shift_id: obj.shift_id,
                    equip_id: unit ? unit.id : null,
                    fuel_truck: fuel_truck.id,
                    fueling_at: `${req.tgl} ${
                         obj.fueling_at || '00:00'
                    }`,
                    smu: parseFloat(obj.hm) || 0,
                    topup: obj.topup,
                    fm_awal: obj.ft_awal,
                    fm_akhir: obj.ft_akhir,
                    user_id: usr.id,
               }

               const trx = await DB.beginTransaction()

               const refuelUnit = new DailyRefueling()
               refuelUnit.fill(addData)
               try {
                    await refuelUnit.save()
                    await trx.commit()
               } catch (error) {
                    console.log(error)
                    await trx.rollback()
                    return {
                         success: false,
                         message:
                              'Failed save data...' +
                              JSON.stringify(error),
                    }
               }
          }

          const masPit = (await MasPit.query().where('sts', 'Y').fetch()).toJSON()

          datax = datax.map(v => {
               if (v.pit_name === 'DERAWAN') {
                    return {
                         ...v,
                         pit_name: 'DERAWAN BARU',
                    }
               } else {
                    return v
               }
          })
          for (const x of masPit) {
               const acc = datax
                    .filter(v => v.pit_name === x.name)
                    .reduce((a, b) => a + b.topup, 0)
               const length = datax.filter(v => v.pit_name === x.name).length

               await NotificationsHelpers.sendNotificationsRefueling(
                    x.name,
                    req.site_id,
                    usr.id,
                    acc,
                    req.tgl,
                    length
               )
          }

          return {
               success: true,
               message: 'Success save data...',
          }
     }

     async show({ auth, params, view }) {
          let usr
          try {
               usr = await auth.getUser()
          } catch (error) {
               return view.render('404')
          }

          const data = (
               await DailyRefueling.query()
                    .where('id', params.id)
                    .last()
          ).toJSON()
          return view.render('operation.daily-refuel-unit.show', {
               data: data,
          })
     }

     async update({ auth, params, request }) {
          let usr
          try {
               usr = await auth.getUser()
          } catch (error) {
               return view.render('404')
          }

          const req = request.except(['_csrf', 'submit'])
          console.log(req)
          try {
               const dailyRefueling = await DailyRefueling.query()
                    .where('id', params.id)
                    .last()
               dailyRefueling.merge(req)
               await dailyRefueling.save()
               return {
                    success: true,
                    message: 'Success update data...',
               }
          } catch (error) {
               console.log(error)
               return {
                    success: false,
                    message:
                         'Success update data...' +
                         JSON.stringify(error),
               }
          }
     }
}

module.exports = DailyRefuelEquipmentController
