'use strict'

const db = use('Database')
const moment = use('moment')
const Helpers = use('Helpers')
const _ = require('underscore')
const MasPit = use('App/Models/MasPit')
const MasEmployee = use('App/Models/MasEmployee')
const DailyRitase = use('App/Models/DailyRitase')
const TimeSheet = use('App/Models/DailyChecklist')
const excelToJson = require('convert-excel-to-json')
const DailyRitaseDetail = use('App/Models/DailyRitaseDetail')
const DailyRitaseHelpers = use('App/Controllers/Http/Helpers/DailyRitase')
const DailyRitaseCoalHelpers = use('App/Controllers/Http/Helpers/DailyRitaseCoal')
const InventoryHelpers = use('App/Controllers/Http/Helpers/Inventory')
const { sendMessage, numberFormatter } = use('App/Controllers/Http/customClass/utils')
const UserDevice = use('App/Models/UserDevice')
const User = use('App/Models/User')
const MasEquipment = use('App/Models/MasEquipment')
const DailyFleet = use('App/Models/DailyFleet')
const DailyPlan = use('App/Models/DailyPlan')
const MasMaterial = use('App/Models/MasMaterial')
const NotificationsHelpers = use('App/Controllers/Http/Helpers/Notifications')
const EmployeeHelpers = use('App/Controllers/Http/Helpers/Employee')

const DailyFleetEquip = use('App/Models/DailyFleetEquip')

const diagnoticTime = use('App/Controllers/Http/customClass/diagnoticTime')
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
      const dailyRitase = (await DailyRitaseHelpers.ALL(req)).toJSON()
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

  async listDetails ( { params } ) {
    const data = await DailyRitaseHelpers.DETAILS(params)
    console.log(data);
    return data
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
      return view.render('_component.trTable-ritase-ob-details')
    } catch (error) {
      console.log(error)
    }
  }

  async getDefaultHaulerByDailyFleet({ request, params, auth }) {
    try {
      const { dailyfleet_id } = params

      const dailyFleet = await DailyFleet.query().where('id', dailyfleet_id).first()

      if (dailyFleet) {
        const haulers = (await DailyFleetEquip.query().where('dailyfleet_id', dailyFleet.toJSON()?.id).with('equipment').fetch()).toJSON().filter(v => v.equipment.tipe != 'excavator')
       let haulerArr = []

        const allHaulers = (await MasEquipment.query().where( w => {
          w.whereIn('tipe', ['hauler truck', 'dump truck', 'articulated'])
        }).fetch()).toJSON()
        const allOperators = (await EmployeeHelpers.OPERATOR(request)).toJSON()

        for (const hauler of haulers) {
          const txt = `<tr class="advance-table-row">
                         <td class="urut text-center" width="50" style="font-size:large">1</td>
                         <td width="*">
                             <div class="row">
                                 <div class="col-md-4">
                                     <label for="tgl">Hauler Unit</label>
                                     <div class="form-group">
                                         <select class="form-control select2Hauler" name="hauler_id" id="hauler_id" data-check="${hauler.equipment.id}" required>
                                         <option value="${hauler.equipment.id}" selected>${hauler.equipment.kode} --|-- ${hauler.equipment.unit_model}</option>
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
                                             <span class="input-group-addon">Rit</span>
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

  async storeUploadExcel({ request, auth }) {
    // const trx = await db.beginTransaction()
    const req = request.all()
    let xuser
    try {
      xuser = await auth.getUser()
    } catch (error) {
      console.log(error)
    }

    var pathData = Helpers.publicPath(`/upload/`)
    const convertJSON = excelToJson({
      sourceFile: `${pathData}${req.current_file_name.replace(/["|']+/g, '')}`,
      header: {
        rows: 2,
      },
      sheets: [req.sheet],
    })


    let dataSheet = convertJSON[req.sheet]

    /* CHECK DAILY PLAN */
    const fleetDaily = await DailyFleet.query().where('id', req.dailyfleet_id).last()
    
    const isDailyPlan = await DailyPlan.query().where( w => {
      w.where('pit_id', fleetDaily.pit_id)
      w.where('current_date', req.date)
      w.where('tipe', 'OB')
    }).last()

    if(!isDailyPlan){
      return {
        success: false,
        message: 'Data Target Plan tanggal : '+req.date+' & IDPit: '+fleetDaily.pit_id+'\ntidak ditemukan...\n\n\nSilahkan Hub. Staff Engineer utk input data target plan nya...'
      }
    }

    /* VALIDATED DATA */
    for (const val of dataSheet) {
      if (val.G) {
        const isOperator = await MasEmployee.query()
          .where(w => {
            w.where('fullname', 'like', `%${val.G}%`)
            w.where('is_operator', 'Y')
          })
          .last()
        if (!isOperator) {
          return {
            success: false,
            message: 'Operator an. [ ' + val.G + ' ] tdk terdaftar dalam sistem...\n\nSilahkan hubungi admin HR utk memperbaharui data karyawannya.',
          }
        }
      }

      if (val.A) {
        const isExcavator = await MasEquipment.query().where('kode', val.A).last()
        if (!isExcavator) {
          return {
            success: false,
            message: 'Equipment unit [ ' + val.A + ' ] tdk terdaftar dalam sistem...\n\nSilahkan hubungi admin plan utk memperbaharui data equipmentnya.',
          }
        }
      }

      if (val.B) {
        const isHauler = await MasEquipment.query().where('kode', val.B).last()
        if (!isHauler) {
          return {
            success: false,
            message: 'Equipment unit [ ' + val.B + ' ] tdk terdaftar dalam sistem...\n\nSilahkan hubungi admin plan utk memperbaharui data equipmentnya.',
          }
        }
      }

      if (!val.H) {
        return {
          success: false,
          message: 'Waktu operational pada hauler ' + val.B + ' belum tentukan...\n\nPeriksa kembali file excel yang anda upload.',
        }
      }
    }

    

    let dataParsing = []
    for (const [i, obj] of dataSheet.entries()) {
      if (obj.A || obj.B) {
        dataParsing.push({
          times: obj.H,
          kd_exca: obj.A,
          kd_hauler: obj.B,
          material_blasting: obj.C || null,
          material_ob: obj.D || null,
          material_soil: obj.E || null,
          material_lumpur: obj.F || null,
          opr_name: obj.G || null,
        })
      }
    }
    
    /* GROUPING BY EXCAVATOR FOR DAILY RITASE DATA OB */
    const OB = dataParsing.filter(e => e.material_ob != null)
    if (OB.length > 0) {
      let GRP_OB = _.groupBy(OB, 'kd_exca')
      GRP_OB = Object.keys(GRP_OB).map(key => {
        return {
          exca: key,
          items: GRP_OB[key],
        }
      })

      
      console.log('MATERIAL OB ::', GRP_OB);

      for (const obj of GRP_OB) {
        const dailyFleet = await DailyFleet.query().where('id', req.dailyfleet_id).last()
        const exca_unit = await MasEquipment.query().where('kode', obj.exca).last()

        /* FILL DATA DAILY RITASE OB */
        const dailyRitase = new DailyRitase()
        dailyRitase.fill({
          dailyfleet_id: dailyFleet.id,
          pit_id: dailyFleet.pit_id,
          shift_id: dailyFleet.shift_id,
          exca_id: exca_unit.id,
          site_id: exca_unit.site_id,
          material: 12,
          distance: req.distance,
          tot_ritase: obj.items.reduce((a, b) => {
            return a + parseInt(b.material_ob)
          }, 0),
          date: req.date,
          user_id: xuser.id,
          description: req.current_file_name.replace(/["|']+/g, ''),
        })

        try {
          await dailyRitase.save()

          /* FILL DAILY RITASE DETAILS OB */
          for (const val of obj.items) {
            const hauler_unit = await MasEquipment.query().where('kode', val.kd_hauler).last()
            const oprUnit = await MasEmployee.query()
              .where(w => {
                w.where('fullname', 'like', `%${val.opr_name}%`)
                w.where('is_operator', 'Y')
              })
              .last()

            var lenOB = val.material_ob
            for (let i = 0; i < lenOB; i++) {
              const ritaseDetails = new DailyRitaseDetail()
              ritaseDetails.fill({
                dailyritase_id: dailyRitase.id,
                checker_id: req.checker_id,
                spv_id: req.spv_id,
                hauler_id: hauler_unit.id,
                opr_id: oprUnit.id,
                check_in: moment(req.date).hours(val.times).format('YYYY-MM-DD HH:mm'),
                urut: i + 1,
                duration: 0,
                satuan: 'menit',
              })

              try {
                await ritaseDetails.save()
              } catch (error) {
                console.log(error)
                // await trx.rollback()
                return {
                  success: false,
                  message: 'ERR save daily ritase details, \nerrcode: ' + JSON.stringify(error),
                }
              }
            }
          }

          /** NOTIF V2 */
          const notifParams = {
            headings: 'Daily Ritase OB ',
            subtitle: `Exca : ${exca_unit.kode}`,
            message: `Material Over Burden`,
          }

          await NotificationsHelpers.sendNotif_v2(notifParams, ['administrator'])

        } catch (error) {
          console.log(error)
          // await trx.rollback()
          return {
            success: false,
            message: 'ERR save daily ritase, \nerrcode: ' + JSON.stringify(error),
          }
        }
      }
    }

    /* GROUPING BY EXCAVATOR FOR DAILY RITASE DATA SOIL */
    const SO = dataParsing.filter(e => e.material_soil != null)
    if (SO.length > 0) {
      let GRP_SO = _.groupBy(SO, 'kd_exca')
      GRP_SO = Object.keys(GRP_SO).map(key => {
        return {
          exca: key,
          items: GRP_SO[key],
        }
      })

      console.log('MATERIAL SOIL ::', GRP_SO);
      for (const obj of GRP_SO) {
        const dailyFleet = await DailyFleet.query().where('id', req.dailyfleet_id).last()
        const exca_unit = await MasEquipment.query().where('kode', obj.exca).last()

        /* FILL DATA DAILY RITASE OB */
        const dailyRitase = new DailyRitase()
        dailyRitase.fill({
          dailyfleet_id: dailyFleet.id,
          pit_id: dailyFleet.pit_id,
          shift_id: dailyFleet.shift_id,
          exca_id: exca_unit.id,
          site_id: exca_unit.site_id,
          material: 12,
          distance: req.distance,
          tot_ritase: obj.items.reduce((a, b) => {
            return a + parseInt(b.material_soil)
          }, 0),
          date: req.date,
          user_id: xuser.id,
          description: req.current_file_name.replace(/["|']+/g, ''),
        })

        try {
          await dailyRitase.save()

          for (const val of obj.items) {
            const hauler_unit = await MasEquipment.query().where('kode', val.kd_hauler).last()
            const oprUnit = await MasEmployee.query()
              .where(w => {
                w.where('fullname', 'like', `%${val.opr_name}%`)
                w.where('is_operator', 'Y')
              })
              .last()

            var lenSOIL = val.material_soil
            for (let i = 0; i < lenSOIL; i++) {
              const ritaseDetails = new DailyRitaseDetail()
              ritaseDetails.fill({
                dailyritase_id: dailyRitase.id,
                checker_id: req.checker_id,
                spv_id: req.spv_id,
                hauler_id: hauler_unit.id,
                opr_id: oprUnit.id,
                check_in: moment(req.date).hours(val.times).format('YYYY-MM-DD HH:mm'),
                urut: i + 1,
                duration: 0,
                satuan: 'menit',
              })

              try {
                await ritaseDetails.save()
              } catch (error) {
                console.log(error)
                // await trx.rollback()
                return {
                  success: false,
                  message: 'ERR save daily ritase details, \nerrcode: ' + JSON.stringify(error),
                }
              }
            }
          }

          /** NOTIF V2 */
          const notifParams = {
            headings: 'Daily Ritase OB ',
            subtitle: `Exca : ${exca_unit.kode}`,
            message: `Material Soil`,
          }

          await NotificationsHelpers.sendNotif_v2(notifParams, ['administrator'])

        } catch (error) {
          console.log(error)
          // await trx.rollback()
          return {
            success: false,
            message: 'ERR save daily ritase, \nerrcode: ' + JSON.stringify(error),
          }
        }
      }
      
    }

    /* GROUPING BY EXCAVATOR FOR DAILY RITASE DATA LUMPUR */
    const MD = dataParsing.filter(e => e.material_lumpur != null)
    if (MD.length > 0) {
      let GRP_MD = _.groupBy(MD, 'kd_exca')
      GRP_MD = Object.keys(GRP_MD).map(key => {
        return {
          exca: key,
          items: GRP_MD[key],
        }
      })

      console.log('MATERIAL LUMPUR ::', GRP_MD);
      for (const obj of GRP_MD) {
        const dailyFleet = await DailyFleet.query().where('id', req.dailyfleet_id).last()
        const exca_unit = await MasEquipment.query().where('kode', obj.exca).last()

        /* FILL DATA DAILY RITASE OB */
        const dailyRitase = new DailyRitase()
        dailyRitase.fill({
          dailyfleet_id: dailyFleet.id,
          pit_id: dailyFleet.pit_id,
          shift_id: dailyFleet.shift_id,
          exca_id: exca_unit.id,
          site_id: exca_unit.site_id,
          material: 10,
          distance: req.distance,
          tot_ritase: obj.items.reduce((a, b) => {
            return a + parseInt(b.material_lumpur)
          }, 0),
          date: req.date,
          user_id: xuser.id,
          description: req.current_file_name.replace(/["|']+/g, ''),
        })

        try {
          await dailyRitase.save()

          for (const val of obj.items) {
            const hauler_unit = await MasEquipment.query().where('kode', val.kd_hauler).last()
            const oprUnit = await MasEmployee.query()
              .where(w => {
                w.where('fullname', 'like', `%${val.opr_name}%`)
                w.where('is_operator', 'Y')
              })
              .last()

            var lenMD = val.material_lumpur
            for (let i = 0; i < lenMD; i++) {
              const ritaseDetails = new DailyRitaseDetail()
              ritaseDetails.fill({
                dailyritase_id: dailyRitase.id,
                checker_id: req.checker_id,
                spv_id: req.spv_id,
                hauler_id: hauler_unit.id,
                opr_id: oprUnit.id,
                check_in: moment(req.date).hours(val.times).format('YYYY-MM-DD HH:mm'),
                urut: i + 1,
                duration: 0,
                satuan: 'menit',
              })

              try {
                await ritaseDetails.save()
              } catch (error) {
                console.log(error)
                return {
                  success: false,
                  message: 'ERR save daily ritase details, \nerrcode: ' + JSON.stringify(error),
                }
              }
            }
          }

          /** NOTIF V2 */
          const notifParams = {
            headings: 'Daily Ritase OB ',
            subtitle: `Exca : ${exca_unit.kode}`,
            message: `Material Lumpur`,
          }

          await NotificationsHelpers.sendNotif_v2(notifParams, ['administrator'])
          
        } catch (error) {
          console.log(error)
          return {
            success: false,
            message: 'ERR save daily ritase, \nerrcode: ' + JSON.stringify(error),
          }
        }
      }
    }

    /* GROUPING BY EXCAVATOR FOR DAILY RITASE DATA BLASTING */
    const BM = dataParsing.filter(e => e.material_blasting != null)
    if (BM.length > 0) {
      let GRP_BM = _.groupBy(BM, 'kd_exca')
      GRP_BM = Object.keys(GRP_BM).map(key => {
        return {
          exca: key,
          items: GRP_BM[key],
        }
      })

      // console.log(JSON.stringify(GRP_OB, null, 2));
      console.log('MATERIAL BLASTING ::', GRP_BM);
      for (const obj of GRP_BM) {
        const dailyFleet = await DailyFleet.query().where('id', req.dailyfleet_id).last()
        const exca_unit = await MasEquipment.query().where('kode', obj.exca).last()

        /* FILL DATA DAILY RITASE OB */
        const dailyRitase = new DailyRitase()
        dailyRitase.fill({
          dailyfleet_id: dailyFleet.id,
          pit_id: dailyFleet.pit_id,
          shift_id: dailyFleet.shift_id,
          exca_id: exca_unit.id,
          site_id: exca_unit.site_id,
          material: 15,
          distance: req.distance,
          tot_ritase: obj.items.reduce((a, b) => {
            return a + parseInt(b.material_blasting)
          }, 0),
          date: req.date,
          user_id: xuser.id,
          description: req.current_file_name.replace(/["|']+/g, ''),
        })

        try {
          await dailyRitase.save()

          console.log('Total Blasting ::', obj.items.reduce((a, b) => {return a + b.material_blasting}, 0));
          console.log(obj);
          for (const val of obj.items) {
            const hauler_unit = await MasEquipment.query().where('kode', val.kd_hauler).last()
            const oprUnit = await MasEmployee.query()
              .where(w => {
                w.where('fullname', 'like', `%${val.opr_name}%`)
                w.where('is_operator', 'Y')
              })
              .last()

            var lenBM = val.material_blasting
            for (let i = 0; i < lenBM; i++) {
              const ritaseDetails = new DailyRitaseDetail()
              ritaseDetails.fill({
                dailyritase_id: dailyRitase.id,
                checker_id: req.checker_id,
                spv_id: req.spv_id,
                hauler_id: hauler_unit.id,
                opr_id: oprUnit.id,
                check_in: moment(req.date).hours(val.times).format('YYYY-MM-DD HH:mm'),
                urut: i + 1,
                duration: 0,
                satuan: 'menit',
              })

              try {
                await ritaseDetails.save()
              } catch (error) {
                console.log(error)
                return {
                  success: false,
                  message: 'ERR save daily ritase details, \nerrcode: ' + JSON.stringify(error),
                }
              }
            }
          }

          /** NOTIF V2 */
          const notifParams = {
            headings: 'Daily Ritase OB ',
            subtitle: `Exca : ${exca_unit.kode}`,
            message: `Material Blasting`
          }

          await NotificationsHelpers.sendNotif_v2(notifParams, ['administrator'])

        } catch (error) {
          console.log(error)
          return {
            success: false,
            message: 'ERR save daily ritase, \nerrcode: ' + JSON.stringify(error),
          }
        }
      }
    }

    return {
      success: true,
      message: 'Berhasil menyimpan data...',
    }
  }

  async uploadFileBackDate({ auth, request }) {
    const validateFile = {
      types: ['xls', 'xlsx'],
      types: 'application',
    }

    const reqFile = request.file('back-date-upload', validateFile)
    let aliasName
    if (reqFile) {
      aliasName = `${reqFile.clientName}-${moment().format('DDMMYYHHmm')}.${reqFile.extname}`

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
        // fileName: aliasName,
        fileName: reqFile.clientName + '-' + moment().format('DDMMYYHHmm') + '.' + reqFile.extname,
      }
    } else {
      return {
        title: ['No File Upload'],
        data: [],
      }
    }
  }

  async uploadFile({ auth, request }) {
    const validateFile = {
      types: ['xls', 'xlsx'],
      types: 'application',
    }

    const reqFile = request.file('detail-ritase-ob', validateFile)
    let aliasName
    if (reqFile) {
      aliasName = `detail-ritase-ob-${moment().format('DDMMYYHHmmss')}.${reqFile.extname}`
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

  async storeBackDate({ request, auth }) {
    const req = request.all()
    let xuser


    var t0 = performance.now()
    let durasi

    try {
      xuser = await auth.getUser()
    } catch (error) {
      console.log(error)
    }

    const fileName = req.current_file_name ? JSON.parse(req.current_file_name) : false

    var pathData = Helpers.publicPath(`/upload/`)
    const filePath = `${pathData}${fileName}`

    try {
      let data = null

      if (req.sheet && req.sheet === 'OB') {
        data = await DailyRitaseHelpers.GET_MONTH_EXCEL_DATA_PRODUCTION(filePath, req, xuser)

        await NotificationsHelpers.sendBasicNotification(fileName)
      } else if (req.sheet && req.sheet === 'COAL') {
        data = await DailyRitaseCoalHelpers.GET_MONTH_EXCEL_DATA_PRODUCTION(filePath, req, xuser)

        await NotificationsHelpers.sendBasicNotification(fileName)
      } else if (req.sheet && req.sheet.includes('PR')) {
        data = await InventoryHelpers.GET_MONTH_EXCEL_DATA_PURCHASE_REQUEST_INVENTORY(filePath, req, xuser)
      } else if (req.sheet && req.sheet.includes('Stock')) {
        data = await InventoryHelpers.GET_MONTH_EXCEL_DATA_STOCK_INVENTORY(filePath, req, xuser)
      }

      return {
        success: true,
        data: data,
        message: 'data berhasil di upload ' + data.dr + ' items...',
      }
    } catch (error) {
      console.log(error)
      return {
        success: false,
        message: error,
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

    const uploadData = req.current_file_name ? JSON.parse(req.current_file_name) : false

    if (uploadData) {
      var pathData = Helpers.publicPath(`/upload/`)
      const filePath = `${pathData}${JSON.parse(req.current_file_name)}`

      try {
        const data = await DailyRitaseHelpers.GET_HOURLY_EXCEL_DATA(filePath, req, xuser)
        const checkerName = data && data.length > 0 ? `${data[0][0].checker.profile.nm_depan} ${data[0][0].checker.profile.nm_belakang}` : 'No Name'
        /** after being uploaded, then throw a notif to the company's owner */
        await NotificationsHelpers.sendNotifications(req, req.date, data[0], checkerName)

        return {
          success: true,
          data: data,
          message: 'data berhasil di upload ' + data.length + ' items...',
        }
      } catch (error) {
        console.log(error)
        return {
          success: false,
          message: error
        }
      }
    } else {
      const reqx = request.only(['date', 'dailyfleet_id', 'exca_id', 'material', 'distance', 'checker_id', 'spv_id'])
      const reqCollect = request.collect(['hauler_id', 'opr_id', 'check_in', 'qty'])

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

        const dailyFleetEquip = (await DailyFleetEquip.query().with('equipment').where('dailyfleet_id', reqx.dailyfleet_id).fetch()).toJSON()

        const currentDailyFleetEquipIds = dailyFleetEquip.filter(v => v.equipment.tipe !== 'excavator').map(v => v.equipment.id)
        const ritaseHaulers = reqCollect.map(v => parseInt(v.hauler_id))

        const newEquipment = _.difference(ritaseHaulers, currentDailyFleetEquipIds)

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

        const checkDailyFleetExca = dailyFleetEquip.length > 0 && dailyFleetEquip.some(v => v.equipment.tipe === 'excavator')

        if (checkDailyFleetExca) {
          const excaID = dailyFleetEquip.filter(v => v.equipment.tipe === 'excavator')[0]?.equip_id
          const checkIfExist = await DailyRitase.query()
            .where(wh => {
              wh.where('date', reqx.date)
              wh.andWhere('exca_id', excaID)
              wh.andWhere('distance', reqx.distance)
              wh.andWhere('material', reqx.material)
              wh.andWhere('dailyfleet_id', reqx.dailyfleet_id)
            })
            .last()

          if (checkIfExist) {
            xDailyRitase = checkIfExist
            console.log('use existing')
          } else {
            xDailyRitase = new DailyRitase()
            xDailyRitase.fill({
              dailyfleet_id: reqx.dailyfleet_id,
              exca_id: excaID,
              material: reqx.material,
              distance: reqx.distance,
              date: reqx.date,
            })
            await xDailyRitase.save()
            console.log('use new')
          }

          if (newEquipment.length > 0) {
            for (const equip of newEquipment) {
              const dailyFleetEquip = new DailyFleetEquip()

              dailyFleetEquip.fill({
                dailyfleet_id: dailyFleet.id,
                equip_id: equip,
                datetime: `${reqx.date} ${GET_DATA_RITASE_HAULER(equip).check_in}:00`,
              })
              await dailyFleetEquip.save()
            }
          }

          for (const obj of prepData) {
            if (parseInt(obj.qty) > 0) {
              for (let i = 0; i < parseInt(obj.qty); i++) {
                const xRitaseDetail = new DailyRitaseDetail()
                xRitaseDetail.fill({
                  hauler_id: obj.hauler_id,
                  opr_id: obj.opr_id,
                  check_in: moment(reqx.date).format('YYYY-MM-DD') + ' ' + obj.check_in,
                  checker_id: obj.checker_id,
                  spv_id: obj.spv_id,
                  dailyritase_id: xDailyRitase.id
                })
                await xRitaseDetail.save()
                console.log('success save daily ritase detail >> , ', xRitaseDetail.id)
              }
            }
          }

          let xresult = null

          if (checkIfExist) {
            xresult = (
              await DailyRitaseDetail.query()
                .with('daily_ritase', wh => {
                  wh.with('material_details')
                })
                .with('checker', wh => {
                  wh.with('profile')
                })
                .with('spv', wh => {
                  wh.with('profile')
                })
                .where('dailyritase_id', checkIfExist?.id)
                .fetch()
            ).toJSON()
          } else {
            xresult = (
              await DailyRitaseDetail.query()
                .with('daily_ritase', wh => {
                  wh.with('material_details')
                })
                .with('checker', wh => {
                  wh.with('profile')
                })
                .with('spv', wh => {
                  wh.with('profile')
                })
                .where('dailyritase_id', xDailyRitase.id)
                .fetch()
            ).toJSON()
          }

          /** after being uploaded, then throw a notif to the company's owner */
          const userRec = (await User.query().whereIn('user_tipe', ['owner', 'administrator', 'manager']).fetch()).toJSON()

          for (const obj of userRec) {
            const userDevices = (await UserDevice.query().where('user_id', obj.id).fetch()).toJSON()

            if (userDevices) {
              const xhours = reqCollect[0].check_in

              const xexcaName = (await MasEquipment.query().where('id', excaID).first()).toJSON().kode

              const xpitName = (await DailyFleet.query().with('pit').where('id', reqx.dailyfleet_id).first()).toJSON().pit.name

              const xmaterialName = (await MasMaterial.query().where('id', reqx.material).first()).toJSON().name

              const xstart = moment(`${reqx.date} ${xhours}`).startOf('hour').format('HH:mm')
              const xend = moment(`${reqx.date} ${xhours}`).endOf('hour').format('HH:mm')

              const checkerName = xresult && xresult.length > 0 ? `${xresult[0].checker.profile.nm_depan} ${xresult[0].checker.profile.nm_belakang}` : 'No Name'
              const totalBCM = xresult.reduce((a, b) => a + b.daily_ritase.material_details.vol, 0) || 0
              let msg = `Hourly Report OB ${xstart} - ${xend} | ${moment(reqx.date).format('DD MMM')}
                                   ${xpitName} - ${xexcaName} - ${xmaterialName}
                                   BCM : ${await numberFormatter(String(totalBCM))}
                                   Author : ${checkerName}
                                   `

              const _dat = {}

              for (const x of userDevices) {
                await sendMessage(x.playerId, msg, _dat, x.platform)
              }
            }
          }

          return {
            success: true,
            data: xresult,
            message: 'data berhasil di simpan ' + xresult.length + ' items...',
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
      const dailyRitase = await DailyRitaseHelpers.BY_PIT(params, req)
      return view.render('operation.daily-ritase-ob.list-by', {
        list: dailyRitase.toJSON(),
        filtered: 'pit',
        id: params.pit_id,
      })
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
      const dailyRitase = await DailyRitaseHelpers.BY_FLEET(params, req)

      return view.render('operation.daily-ritase-ob.list-by', {
        list: dailyRitase.toJSON(),
        filtered: 'fleet',
        id: params.fleet_id,
      })
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
      const dailyRitase = await DailyRitaseHelpers.BY_SHIFT(params, req)
      return view.render('operation.daily-ritase-ob.list-by', {
        list: dailyRitase.toJSON(),
        filtered: 'shift',
        id: params.shift_id,
      })
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
    const dailyRitase = await DailyRitaseHelpers.RITASE_BY_DAILY_ID(req)
    let data = dailyRitase.toJSON()
    const timeSheet = (await TimeSheet.query().with('operator_unit').fetch()).toJSON()

    for (let [i, item] of data.entries()) {
      const xx = _.find(timeSheet, x => x.dailyfleet_id === item.daily_ritase.dailyfleet_id && x.unit_id === item.hauler_id)
      if (xx) {
        data[i] = {
          ...item,
          operator: xx.operator_unit.fullname,
        }
      } else {
        data[i] = { ...item, operator: 'not set' }
      }
    }
    return view.render('operation.daily-ritase-ob.show-detais-ritase', {
      list: data,
    })
  }

  async show({ params, view }) {
    try {
      const dailyRitase = await DailyRitaseHelpers.ID_SHOW(params)
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
      await db.table('daily_ritase_details').where('id', id).update(dailyRitaseDetail.toJSON())
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
