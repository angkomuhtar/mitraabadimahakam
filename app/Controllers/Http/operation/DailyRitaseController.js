'use strict'

const db = use('Database')
const moment = use('moment')
const Helpers = use('Helpers')
const _ = require('underscore')
const MasPit = use('App/Models/MasPit')
const DailyRitase = use('App/Models/DailyRitase')
const TimeSheet = use('App/Models/DailyChecklist')
const excelToJson = require('convert-excel-to-json')
const DailyRitaseDetail = use('App/Models/DailyRitaseDetail')
const DailyRitaseHelpers = use(
     'App/Controllers/Http/Helpers/DailyRitase'
)
const { sendMessage, numberFormatter } = use(
     'App/Controllers/Http/customClass/utils'
)
const UserDevice = use('App/Models/UserDevice')
const User = use('App/Models/User')
const MasEquipment = use('App/Models/MasEquipment')
const DailyFleet = use('App/Models/DailyFleet')
const MasMaterial = use('App/Models/MasMaterial')
const NotificationsHelpers = use(
     'App/Controllers/Http/Helpers/Notifications'
)
const EmployeeHelpers = use('App/Controllers/Http/Helpers/Employee')

const DailyFleetEquip = use('App/Models/DailyFleetEquip')

class DailyRitaseController {
     async index({ view }) {
          return view.render('operation.daily-ritase-ob.index')
     }

     async showBackDateUpload({ view, auth }) {
          try {
               await auth.getUser()
               return view.render('operation.daily-ritase-ob.backDateUpload')
          } catch (error) {
               console.log(error)
          }
     }
     async list({ request, view }) {
          const req = request.all()
          try {
               const dailyRitase = (
                    await DailyRitaseHelpers.ALL(req)
               ).toJSON()
               return view.render('operation.daily-ritase-ob.list', {
                    list: dailyRitase,
                    limit: req.limit || 25,
               })
          } catch (error) {
               console.log(error)
               return {
                    success: false,
                    message: error.message,
               }
          }
     }

     async graph({ view, auth }) {
          try {
               await auth.getUser()
               return view.render('operation.daily-ritase-ob.graph')
          } catch (error) {
               console.log(error)
          }
     }

     async create({ view, auth }) {
          try {
               await auth.getUser()
               return view.render('operation.daily-ritase-ob.create')
          } catch (error) {
               console.log(error)
          }
     }

     async addItems({ view, auth }) {
          try {
               await auth.getUser()
               return view.render(
                    '_component.trTable-ritase-ob-details'
               )
          } catch (error) {
               console.log(error)
          }
     }

     async getDefaultHaulerByDailyFleet({ request, params, auth }) {
          try {
               const { dailyfleet_id } = params

               const dailyFleet = await DailyFleet.query()
                    .where('id', dailyfleet_id)
                    .first()

               if (dailyFleet) {
                    const haulers = (
                         await DailyFleetEquip.query()
                              .where(
                                   'dailyfleet_id',
                                   dailyFleet.toJSON()?.id
                              )
                              .with('equipment')
                              .fetch()
                    )
                         .toJSON()
                         .filter(
                              v => v.equipment.tipe === 'hauler truck'
                         )
                    let haulerArr = []

                    const allHaulers = (
                         await MasEquipment.query()
                              .where('tipe', 'hauler truck')
                              .fetch()
                    ).toJSON()
                    const allOperators = (
                         await EmployeeHelpers.OPERATOR(request)
                    ).toJSON()

                    for (const hauler of haulers) {
                         const txt = `<tr class="advance-table-row">
                         <td class="urut text-center" width="50" style="font-size:large">1</td>
                         <td width="*">
                             <div class="row">
                                 <div class="col-md-4">
                                     <label for="tgl">Hauler Unit</label>
                                     <div class="form-group">
                                         <select class="form-control select2Hauler" name="hauler_id" id="hauler_id" data-check="${
                                              hauler.equipment.id
                                         }" required>
                                         <option value="${
                                              hauler.equipment.id
                                         }" selected>${
                              hauler.equipment.kode
                         } --|-- ${
                              hauler.equipment.unit_model
                         }</option>
                                         ${allHaulers.map(v => {
                                              return `
                                                  <option value="${v.id}">${v.kode} --|-- ${v.unit_model}</option>
                                              `
                                         })}
                                         </select>
                                     </div>
                                 </div>
                                 <div class="col-md-4">
                                     <label for="tgl">Operator Hauler</label>
                                     <div class="form-group">
                                         <select class="form-control select2operator" name="opr_id" id="opr_id" data-check="${allOperators[0].id}" required>
                                         ${allOperators.map(v => {
                                              return `
                                              <option value="${v.id}">${v.fullname}</option>`
                                         })}
                                         </select>
                                     </div>
                                 </div>
                                 <div class="col-md-2">
                                     <label for="tgl">Waktu/Jam</label>
                                     <div class="form-group">
                                         <select class="form-control" name="check_in" id="check_in" required>
                                             <option value="">Pilih Jam</option>
                                             <optgroup label="Shift Pagi">
                                                 <option value="07:59">Pukul 07 pagi</option>
                                                 <option value="08:59">Pukul 08 pagi</option>
                                                 <option value="09:59">Pukul 09 pagi</option>
                                                 <option value="10:59">Pukul 10 pagi</option>
                                                 <option value="11:59">Pukul 11 pagi</option>
                                                 <option value="12:59">Pukul 12 siang</option>
                                                 <option value="13:59">Pukul 13 siang</option>
                                                 <option value="14:59">Pukul 14 siang</option>
                                                 <option value="15:59">Pukul 15 siang</option>
                                                 <option value="16:59">Pukul 16 sore</option>
                                                 <option value="17:59">Pukul 17 sore</option>
                                                 <option value="18:59">Pukul 18 sore</option>
                                             </optgroup>
                                             <optgroup label="Shift Malam">
                                                 <option value="19:59">Pukul 19 malam</option>
                                                 <option value="20:59">Pukul 20 malam</option>
                                                 <option value="21:59">Pukul 21 malam</option>
                                                 <option value="22:59">Pukul 22 malam</option>
                                                 <option value="23:59">Pukul 23 malam</option>
                                                 <option value="00:59">Pukul 00 tengah malam</option>
                                                 <option value="01:59">Pukul 01 dini hari</option>
                                                 <option value="02:59">Pukul 02 dini hari</option>
                                                 <option value="03:59">Pukul 03 dini hari</option>
                                                 <option value="04:59">Pukul 04 dini hari</option>
                                                 <option value="05:59">Pukul 05 dini hari</option>
                                                 <option value="06:59">Pukul 06 pagi</option>
                                             </optgroup>
                                         </select>
                                     </div>
                                 </div>
                                 <div class="col-md-2">
                                     <label for="tgl">Jumlah</label>
                                     <div class="form-group">
                                         <div class="input-group">
                                             <input type="text" class="form-control" name="qty">
                                             <span class="input-group-addon">Ritase</span>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </td>
                         <td width="10">
                             <div class="form-group" style="margin-bottom: 0px;">
                                 <button type="button" class="btn btn-success btn-circle bt-add-items"><i class="fa fa-plus"></i> </button>
                                 <button type="button" class="btn btn-danger btn-circle bt-delete-items"><i class="fa fa-trash"></i> </button>
                             </div>
                     
                         </td>
                     </tr>`

                         haulerArr.push(txt)
                    }

                    console.log('haulers >> ', haulerArr)
                    return {
                         success: true,
                         data: haulerArr,
                    }
               } else {
                    return {
                         success: false,
                         message: 'daily fleet id not founds',
                    }
               }
          } catch (error) {
               console.log(error)
          }
     }

     // async store({ request, auth }) {
     //      const req = request.all()
     //      let xuser
     //      try {
     //           xuser = await auth.getUser()
     //      } catch (error) {
     //           console.log(error)
     //      }

     //      const validateFile = {
     //           types: ['xls', 'xlsx'],
     //           size: '2mb',
     //           types: 'application',
     //      }

     //      const uploadData = request.file(
     //           'detail-ritase-ob',
     //           validateFile
     //      )

     //      let aliasName

     //      if (uploadData) {
     //           aliasName = `detail-ritase-ob-${moment().format(
     //                'DDMMYYHHmmss'
     //           )}.${uploadData.extname}`

     //           await uploadData.move(Helpers.publicPath(`/upload/`), {
     //                name: aliasName,
     //                overwrite: true,
     //           })

     //           await uploadData

     //           if (!uploadData.moved()) {
     //                return uploadData.error()
     //           }

     //           var pathData = Helpers.publicPath(`/upload/`)

     //           const convertJSON = excelToJson({
     //                sourceFile: `${pathData}${aliasName}`,
     //                header: {
     //                     rows: 1,
     //                },
     //                sheets: ['FORM'],
     //           })

     //           const data = convertJSON.FORM.filter(
     //                cell => cell.A != '#N/A'
     //           )

     //           try {
     //                const dailyRitase = new DailyRitase()
     //                dailyRitase.fill({
     //                     dailyfleet_id: req.dailyfleet_id,
     //                     exca_id: req.exca_id,
     //                     material: req.material,
     //                     distance: req.distance,
     //                     date: req.date,
     //                })

     //                await dailyRitase.save()

     //                var date = moment(req.date).format('YYYY-MM-DD')
     //                for (const item of data) {
     //                     var clock = moment(item.E).format('HH:mm')
     //                     const ritaseDetail = new DailyRitaseDetail()
     //                     ritaseDetail.fill({
     //                          dailyritase_id: dailyRitase.id,
     //                          checker_id: req.checker_id,
     //                          spv_id: req.spv_id,
     //                          hauler_id: item.A,
     //                          opr_id:
     //                               item.D != '#N/A' ? item.D : null,
     //                          check_in: date + ' ' + clock,
     //                     })
     //                     await ritaseDetail.save()
     //                }

     //                let result = (
     //                     await DailyRitaseDetail.query()
     //                          .with('daily_ritase', wh => {
     //                               wh.with('material_details')
     //                          })
     //                          .with('checker', wh => {
     //                               wh.with('profile')
     //                          })
     //                          .with('spv', wh => {
     //                               wh.with('profile')
     //                          })
     //                          .where('dailyritase_id', dailyRitase.id)
     //                          .fetch()
     //                ).toJSON()

     //                const checkerName =
     //                     result && result.length > 0
     //                          ? `${result[0].checker.profile.nm_depan} ${result[0].checker.profile.nm_belakang}`
     //                          : 'No Name'
     //                /** after being uploaded, then throw a notif to the company's owner */
     //                await NotificationsHelpers.sendNotifications(
     //                     req,
     //                     date,
     //                     result,
     //                     checkerName
     //                )

     //                return {
     //                     success: true,
     //                     data: result,
     //                     message:
     //                          'data berhasil di upload ' +
     //                          result.length +
     //                          ' items...',
     //                }
     //           } catch (error) {
     //                console.log(error)
     //                return {
     //                     success: false,
     //                     message: error,
     //                }
     //           }
     //      } else {
     //           const reqx = request.only([
     //                'date',
     //                'dailyfleet_id',
     //                'exca_id',
     //                'material',
     //                'distance',
     //                'checker_id',
     //                'spv_id',
     //           ])
     //           const reqCollect = request.collect([
     //                'hauler_id',
     //                'opr_id',
     //                'check_in',
     //                'qty',
     //           ])

     //           try {
     //                let xDailyRitase = null

     //                let prepData = reqCollect.map(el => {
     //                     return {
     //                          ...el,
     //                          checker_id: xuser.id,
     //                          spv_id: reqx.spv_id,
     //                     }
     //                })

     //                const checkIfExist = await DailyRitase.query()
     //                     .where(wh => {
     //                          wh.where('date', reqx.date)
     //                          wh.andWhere('exca_id', reqx.exca_id)
     //                          wh.andWhere('distance', reqx.distance)
     //                          wh.andWhere('material', reqx.material)
     //                          wh.andWhere(
     //                               'dailyfleet_id',
     //                               reqx.dailyfleet_id
     //                          )
     //                     })
     //                     .last()

     //                if (checkIfExist) {
     //                     xDailyRitase = checkIfExist
     //                } else {
     //                     xDailyRitase = new DailyRitase()

     //                     xDailyRitase.fill({
     //                          dailyfleet_id: reqx.dailyfleet_id,
     //                          exca_id: reqx.exca_id,
     //                          material: reqx.material,
     //                          distance: reqx.distance,
     //                          date: reqx.date,
     //                     })

     //                     await xDailyRitase.save()
     //                }
     //                for (const obj of prepData) {
     //                     if (parseInt(obj.qty) > 0) {
     //                          for (
     //                               let i = 0;
     //                               i < parseInt(obj.qty);
     //                               i++
     //                          ) {
     //                               const xRitaseDetail =
     //                                    new DailyRitaseDetail()
     //                               xRitaseDetail.fill({
     //                                    hauler_id: obj.hauler_id,
     //                                    opr_id: obj.opr_id,
     //                                    check_in:
     //                                         moment(reqx.date).format(
     //                                              'YYYY-MM-DD'
     //                                         ) +
     //                                         ' ' +
     //                                         obj.check_in,
     //                                    checker_id: obj.checker_id,
     //                                    spv_id: obj.spv_id,
     //                                    dailyritase_id:
     //                                         xDailyRitase.id,
     //                               })
     //                               await xRitaseDetail.save()
     //                          }
     //                     }
     //                }

     //                let xresult = null

     //                if (checkIfExist) {
     //                     console.log('is exist ? yes')
     //                     xresult = (
     //                          await DailyRitaseDetail.query()
     //                               .with('daily_ritase', wh => {
     //                                    wh.with('material_details')
     //                               })
     //                               .with('checker', wh => {
     //                                    wh.with('profile')
     //                               })
     //                               .with('spv', wh => {
     //                                    wh.with('profile')
     //                               })
     //                               .where(
     //                                    'dailyritase_id',
     //                                    checkIfExist?.id
     //                               )
     //                               .fetch()
     //                     ).toJSON()
     //                } else {
     //                     console.log('is exist ? no, lets create one')
     //                     xresult = (
     //                          await DailyRitaseDetail.query()
     //                               .with('daily_ritase', wh => {
     //                                    wh.with('material_details')
     //                               })
     //                               .with('checker', wh => {
     //                                    wh.with('profile')
     //                               })
     //                               .with('spv', wh => {
     //                                    wh.with('profile')
     //                               })
     //                               .where(
     //                                    'dailyritase_id',
     //                                    xDailyRitase.id
     //                               )
     //                               .fetch()
     //                     ).toJSON()
     //                }

     //                /** after being uploaded, then throw a notif to the company's owner */
     //                const userRec = (
     //                     await User.query()
     //                          .whereIn('user_tipe', [
     //                               'owner',
     //                               'administrator',
     //                               'manager',
     //                          ])
     //                          .fetch()
     //                ).toJSON()

     //                for (const obj of userRec) {
     //                     const userDevices = (
     //                          await UserDevice.query()
     //                               .where('user_id', obj.id)
     //                               .fetch()
     //                     ).toJSON()

     //                     if (userDevices) {
     //                          const xhours = reqCollect[0].check_in

     //                          const xexcaName = (
     //                               await MasEquipment.query()
     //                                    .where('id', reqx.exca_id)
     //                                    .first()
     //                          ).toJSON().kode

     //                          const xpitName = (
     //                               await DailyFleet.query()
     //                                    .with('pit')
     //                                    .where(
     //                                         'id',
     //                                         reqx.dailyfleet_id
     //                                    )
     //                                    .first()
     //                          ).toJSON().pit.name

     //                          const xmaterialName = (
     //                               await MasMaterial.query()
     //                                    .where('id', reqx.material)
     //                                    .first()
     //                          ).toJSON().name

     //                          const xstart = moment(
     //                               `${reqx.date} ${xhours}`
     //                          )
     //                               .startOf('hour')
     //                               .format('HH:mm')
     //                          const xend = moment(
     //                               `${reqx.date} ${xhours}`
     //                          )
     //                               .endOf('hour')
     //                               .format('HH:mm')

     //                          const checkerName =
     //                               xresult && xresult.length > 0
     //                                    ? `${xresult[0].checker.profile.nm_depan} ${xresult[0].checker.profile.nm_belakang}`
     //                                    : 'No Name'
     //                          const totalBCM =
     //                               xresult.reduce(
     //                                    (a, b) =>
     //                                         a +
     //                                         b.daily_ritase
     //                                              .material_details
     //                                              .vol,
     //                                    0
     //                               ) || 0
     //                          let msg = `Hourly Report OB ${xstart} - ${xend} | ${moment(
     //                               reqx.date
     //                          ).format('DD MMM')}
     //      ${xpitName} - ${xexcaName} - ${xmaterialName}
     //       BCM : ${await numberFormatter(String(totalBCM))}
     //       Author : ${checkerName}
     //      `

     //                          const _dat = {}

     //                          for (const x of userDevices) {
     //                               await sendMessage(
     //                                    x.playerId,
     //                                    msg,
     //                                    _dat,
     //                                    x.platform
     //                               )
     //                          }
     //                     }
     //                }

     //                return {
     //                     success: true,
     //                     data: xresult,
     //                     message:
     //                          'data berhasil di simpan ' +
     //                          xresult.length +
     //                          ' items...',
     //                }
     //           } catch (error) {
     //                console.log(error)
     //                return {
     //                     success: false,
     //                     message: error,
     //                }
     //           }
     //      }
     // }

     async uploadFile({ auth, request }) {
          const validateFile = {
               types: ['xls', 'xlsx'],
               types: 'application',
          }

          console.log('request >> ', request.all())
          const reqFile = request.file(
               'detail-ritase-ob',
               validateFile
          )
          let aliasName
          if (reqFile) {
               aliasName = `detail-ritase-ob-${moment().format(
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
                    fileName: aliasName,
               }
          } else {
               return {
                    title: ['No File Upload'],
                    data: [],
               }
          }
     }

     async store({ request, auth }) {
          const req = request.all()
          let xuser
          try {
               xuser = await auth.getUser()
          } catch (error) {
               console.log(error)
          }

          const uploadData = req.current_file_name
               ? JSON.parse(req.current_file_name)
               : false

          if (uploadData) {
               var pathData = Helpers.publicPath(`/upload/`)
               const filePath = `${pathData}${JSON.parse(
                    req.current_file_name
               )}`

               try {
                    const data =
                         await DailyRitaseHelpers.GET_HOURLY_EXCEL_DATA(
                              filePath,
                              req,
                              xuser
                         )
                    const checkerName =
                         data && data.length > 0
                              ? `${data[0][0].checker.profile.nm_depan} ${data[0][0].checker.profile.nm_belakang}`
                              : 'No Name'
                    /** after being uploaded, then throw a notif to the company's owner */
                    await NotificationsHelpers.sendNotifications(
                         req,
                         req.date,
                         data[0],
                         checkerName
                    )

                    return {
                         success: true,
                         data: data,
                         message:
                              'data berhasil di upload ' +
                              data.length +
                              ' items...',
                    }
               } catch (error) {
                    console.log(error)
                    return {
                         success: false,
                         message: error,
                    }
               }
          } else {
               const reqx = request.only([
                    'date',
                    'dailyfleet_id',
                    'exca_id',
                    'material',
                    'distance',
                    'checker_id',
                    'spv_id',
               ])
               const reqCollect = request.collect([
                    'hauler_id',
                    'opr_id',
                    'check_in',
                    'qty',
               ])

               console.log('reqx >> ', reqx)

               console.log('req collect >> ', reqCollect)

               try {
                    let xDailyRitase = null

                    let prepData = reqCollect.map(el => {
                         return {
                              ...el,
                              checker_id: xuser.id,
                              spv_id: reqx.spv_id,
                         }
                    })

                    const dailyFleet = await DailyFleet.query()
                         .with('pit', site => site.with('site'))
                         .with('fleet')
                         .with('shift')
                         .with('activities')
                         .where('id', reqx.dailyfleet_id)
                         .first()

                    const dailyFleetEquip = (
                         await DailyFleetEquip.query()
                              .with('equipment')
                              .where(
                                   'dailyfleet_id',
                                   reqx.dailyfleet_id
                              )
                              .fetch()
                    ).toJSON()

                    const currentDailyFleetEquipIds = dailyFleetEquip
                         .filter(
                              v => v.equipment.tipe !== 'excavator'
                         )
                         .map(v => v.equipment.id)
                    const ritaseHaulers = reqCollect.map(
                         v => parseInt(v.hauler_id)
                    )
                    const newEquipment = _.difference(
                         ritaseHaulers,
                         currentDailyFleetEquipIds
                    )

                    const GET_DATA_RITASE_HAULER = hauler_id => {
                         let opr_id = null
                         let check_in = null
                         let qty = null
                         for (const value of reqCollect) {
                              if (parseInt(value.hauler_id) === hauler_id) {
                                   opr_id = value.opr_id
                                   check_in = value.check_in
                                   qty = value.qty
                              }
                         }

                         return {
                              opr_id,
                              check_in,
                              qty,
                         }
                    }

                    const checkDailyFleetExca =
                         dailyFleetEquip.length > 0 &&
                         dailyFleetEquip.some(
                              v => v.equipment.tipe === 'excavator'
                         )

                    if (checkDailyFleetExca) {
                         const excaID = dailyFleetEquip.filter(
                              v => v.equipment.tipe === 'excavator'
                         )[0]?.equip_id

                         const checkIfExist =
                              await DailyRitase.query()
                                   .where(wh => {
                                        wh.where('date', reqx.date)
                                        wh.andWhere('exca_id', excaID)
                                        wh.andWhere(
                                             'distance',
                                             reqx.distance
                                        )
                                        wh.andWhere(
                                             'material',
                                             reqx.material
                                        )
                                        wh.andWhere(
                                             'dailyfleet_id',
                                             reqx.dailyfleet_id
                                        )
                                   })
                                   .last()

                         if (checkIfExist) {
                              xDailyRitase = checkIfExist

                              console.log('this runs')
                         } else {
                              console.log('this runs two')
                              xDailyRitase = new DailyRitase()

                              xDailyRitase.fill({
                                   dailyfleet_id: reqx.dailyfleet_id,
                                   exca_id: excaID,
                                   material: reqx.material,
                                   distance: reqx.distance,
                                   date: reqx.date,
                              })

                              await xDailyRitase.save()
                         }


                         console.log('new equipment >> ', newEquipment)
                         if (newEquipment.length > 0) {
                              for (const equip of newEquipment) {

                              const dailyFleetEquip =
                              new DailyFleetEquip()

                                   dailyFleetEquip.fill({
                                        dailyfleet_id:
                                             dailyFleet.id,
                                        equip_id: equip,
                                        datetime: `${reqx.date} ${GET_DATA_RITASE_HAULER(equip).check_in}:00`,
                                   })
                                   await dailyFleetEquip.save()
                              }
                         }

                         for (const obj of prepData) {
                              if (parseInt(obj.qty) > 0) {
                                   for (
                                        let i = 0;
                                        i < parseInt(obj.qty);
                                        i++
                                   ) {
                                        const xRitaseDetail =
                                             new DailyRitaseDetail()
                                        xRitaseDetail.fill({
                                             hauler_id: obj.hauler_id,
                                             opr_id: obj.opr_id,
                                             check_in:
                                                  moment(
                                                       reqx.date
                                                  ).format(
                                                       'YYYY-MM-DD'
                                                  ) +
                                                  ' ' +
                                                  obj.check_in,
                                             checker_id:
                                                  obj.checker_id,
                                             spv_id: obj.spv_id,
                                             dailyritase_id:
                                                  xDailyRitase.id,
                                        })
                                        await xRitaseDetail.save()
                                   }
                              }
                         }

                         let xresult = null

                         if (checkIfExist) {
                              console.log('is exist ? yes')
                              xresult = (
                                   await DailyRitaseDetail.query()
                                        .with('daily_ritase', wh => {
                                             wh.with(
                                                  'material_details'
                                             )
                                        })
                                        .with('checker', wh => {
                                             wh.with('profile')
                                        })
                                        .with('spv', wh => {
                                             wh.with('profile')
                                        })
                                        .where(
                                             'dailyritase_id',
                                             checkIfExist?.id
                                        )
                                        .fetch()
                              ).toJSON()
                         } else {
                              console.log(
                                   'is exist ? no, lets create one'
                              )
                              xresult = (
                                   await DailyRitaseDetail.query()
                                        .with('daily_ritase', wh => {
                                             wh.with(
                                                  'material_details'
                                             )
                                        })
                                        .with('checker', wh => {
                                             wh.with('profile')
                                        })
                                        .with('spv', wh => {
                                             wh.with('profile')
                                        })
                                        .where(
                                             'dailyritase_id',
                                             xDailyRitase.id
                                        )
                                        .fetch()
                              ).toJSON()
                         }

                         /** after being uploaded, then throw a notif to the company's owner */
                         const userRec = (
                              await User.query()
                                   .whereIn('user_tipe', [
                                        'owner',
                                        'administrator',
                                        'manager',
                                   ])
                                   .fetch()
                         ).toJSON()

                         for (const obj of userRec) {
                              const userDevices = (
                                   await UserDevice.query()
                                        .where('user_id', obj.id)
                                        .fetch()
                              ).toJSON()

                              if (userDevices) {
                                   const xhours =
                                        reqCollect[0].check_in

                                   const xexcaName = (
                                        await MasEquipment.query()
                                             .where('id', excaID)
                                             .first()
                                   ).toJSON().kode

                                   const xpitName = (
                                        await DailyFleet.query()
                                             .with('pit')
                                             .where(
                                                  'id',
                                                  reqx.dailyfleet_id
                                             )
                                             .first()
                                   ).toJSON().pit.name

                                   const xmaterialName = (
                                        await MasMaterial.query()
                                             .where(
                                                  'id',
                                                  reqx.material
                                             )
                                             .first()
                                   ).toJSON().name

                                   const xstart = moment(
                                        `${reqx.date} ${xhours}`
                                   )
                                        .startOf('hour')
                                        .format('HH:mm')
                                   const xend = moment(
                                        `${reqx.date} ${xhours}`
                                   )
                                        .endOf('hour')
                                        .format('HH:mm')

                                   const checkerName =
                                        xresult && xresult.length > 0
                                             ? `${xresult[0].checker.profile.nm_depan} ${xresult[0].checker.profile.nm_belakang}`
                                             : 'No Name'
                                   const totalBCM =
                                        xresult.reduce(
                                             (a, b) =>
                                                  a +
                                                  b.daily_ritase
                                                       .material_details
                                                       .vol,
                                             0
                                        ) || 0
                                   let msg = `Hourly Report OB ${xstart} - ${xend} | ${moment(
                                        reqx.date
                                   ).format('DD MMM')}
                                   ${xpitName} - ${xexcaName} - ${xmaterialName}
                                   BCM : ${await numberFormatter(
                                        String(totalBCM)
                                   )}
                                   Author : ${checkerName}
                                   `

                                   const _dat = {}

                                   for (const x of userDevices) {
                                        await sendMessage(
                                             x.playerId,
                                             msg,
                                             _dat,
                                             x.platform
                                        )
                                   }
                              }
                         }

                         return {
                              success: true,
                              data: xresult,
                              message:
                                   'data berhasil di simpan ' +
                                   xresult.length +
                                   ' items...',
                         }
                    } else {
                         const df = dailyFleet.toJSON()
                         const msg = `${df.pit.kode} | ${df.fleet.name} | ${df.shift.name} | ${df.activities.name}`
                         return {
                              success: false,
                              message: `Daily Fleet ( ${msg} ) belum ada exca yang dipilih, silahkan pilih exca terlebih dahulu`,
                         }
                    }
               } catch (error) {
                    console.log(error)
                    return {
                         success: false,
                         message: error,
                    }
               }
          }
     }

     async listByPIT({ params, request, view }) {
          const req = request.only(['page', 'limit'])
          try {
               const dailyRitase = await DailyRitaseHelpers.BY_PIT(
                    params,
                    req
               )
               return view.render(
                    'operation.daily-ritase-ob.list-by',
                    {
                         list: dailyRitase.toJSON(),
                         filtered: 'pit',
                         id: params.pit_id,
                    }
               )
          } catch (error) {
               console.log(error)
               return {
                    success: false,
                    message: error.message,
               }
          }
     }

     async listByFLEET({ params, request, view }) {
          const req = request.only(['page', 'limit'])
          try {
               const dailyRitase = await DailyRitaseHelpers.BY_FLEET(
                    params,
                    req
               )

               return view.render(
                    'operation.daily-ritase-ob.list-by',
                    {
                         list: dailyRitase.toJSON(),
                         filtered: 'fleet',
                         id: params.fleet_id,
                    }
               )
          } catch (error) {
               console.log(error)
               return {
                    success: false,
                    message: error.message,
               }
          }
     }

     async listBySHIFT({ params, request, view }) {
          const req = request.only(['page', 'limit'])
          try {
               const dailyRitase = await DailyRitaseHelpers.BY_SHIFT(
                    params,
                    req
               )
               return view.render(
                    'operation.daily-ritase-ob.list-by',
                    {
                         list: dailyRitase.toJSON(),
                         filtered: 'shift',
                         id: params.shift_id,
                    }
               )
          } catch (error) {
               console.log(error)
               return {
                    success: false,
                    message: error.message,
               }
          }
     }

     async update({ params, request }) {
          const req = JSON.parse(request.raw())
          try {
               await DailyRitaseHelpers.POST_RITASE_OB(params, req)
               return {
                    success: true,
                    message: 'success update data....',
               }
          } catch (error) {
               console.log(error)
               return {
                    success: false,
                    message: 'failed update data....',
               }
          }
     }

     async listUnitByRitase({ request, view }) {
          const req = request.all()
          const dailyRitase =
               await DailyRitaseHelpers.RITASE_BY_DAILY_ID(req)
          let data = dailyRitase.toJSON()
          const timeSheet = (
               await TimeSheet.query().with('operator_unit').fetch()
          ).toJSON()

          for (let [i, item] of data.entries()) {
               const xx = _.find(
                    timeSheet,
                    x =>
                         x.dailyfleet_id ===
                              item.daily_ritase.dailyfleet_id &&
                         x.unit_id === item.hauler_id
               )
               if (xx) {
                    data[i] = {
                         ...item,
                         operator: xx.operator_unit.fullname,
                    }
               } else {
                    data[i] = { ...item, operator: 'not set' }
               }
          }
          return view.render(
               'operation.daily-ritase-ob.show-detais-ritase',
               {
                    list: data,
               }
          )
     }

     async show({ params, view }) {
          try {
               const dailyRitase = await DailyRitaseHelpers.ID_SHOW(
                    params
               )
               return view.render('operation.daily-ritase-ob.show', {
                    data: dailyRitase.toJSON(),
               })
          } catch (error) {
               console.log(error)
               return {
                    success: false,
                    message: error.message,
               }
          }
     }

     async updateDetails({ params, request }) {
          const { id } = params
          const req = request.all()
          const dailyRitaseDetail = await DailyRitaseDetail.find(id)
          dailyRitaseDetail.merge(req)
          console.log(dailyRitaseDetail.toJSON())
          try {
               await db
                    .table('daily_ritase_details')
                    .where('id', id)
                    .update(dailyRitaseDetail.toJSON())
               return {
                    success: true,
                    message: 'success update details....',
               }
          } catch (error) {
               return {
                    success: false,
                    message: 'failed update details....',
               }
          }
     }

     async detailDestroy({ params, request }) {
          const { id } = params
          const dailyRitaseDetail = await DailyRitaseDetail.find(id)
          try {
               await dailyRitaseDetail.delete()
               return {
                    success: true,
                    message: 'success delete details....',
               }
          } catch (error) {
               return {
                    success: false,
                    message: 'failed delete details....',
               }
          }
     }

     async test({ params, request, response }) {
          await sendMessage()
     }
}

module.exports = DailyRitaseController
