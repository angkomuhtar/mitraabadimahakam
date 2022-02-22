'use strict'

const DailyFleet = use('App/Models/DailyFleet')
const DailyRitase = use('App/Models/DailyRitase')
const DailyRitaseDetail = use('App/Models/DailyRitaseDetail')
const MonthlyPlans = use('App/Models/MonthlyPlan')
const DailyPlans = use('App/Models/DailyPlan')
const moment = require('moment')
const excelToJson = require('convert-excel-to-json')
const fs = require('fs')
const _ = require('underscore')
const MasShift = use('App/Models/MasShift')
const MasPit = use('App/Models/MasPit')
const MasFleet = use('App/Models/MasFleet')
const MasEquipment = use('App/Models/MasEquipment')
const DailyFleetEquipment = use('App/Models/DailyfleetEquip')
const MasMaterial = use('App/Models/MasMaterial')

class Ritase {
     async ALL(req) {
          const limit = parseInt(req.limit)
          const halaman =
               req.page === undefined ? 1 : parseInt(req.page)
          let dailyRitase
          let arrFilter
          if (req.keyword) {
               const fleet = await DailyFleet.query()
                    .where(w => {
                         if (req.fleet_id) {
                              w.where('fleet_id', req.fleet_id)
                         }

                         if (req.shift_id) {
                              w.where('shift_id', req.shift_id)
                         }
                    })
                    .fetch()

               if (fleet) {
                    arrFilter = fleet.toJSON().map(item => item.id)
               }

               console.log(req)

               dailyRitase = await DailyRitase.query()
                    .with('material_details')
                    .with('ritase_details', item => {
                         item.with('checker', b => b.with('profile'))
                         item.with('spv', b => b.with('profile'))
                         item.with('hauler')
                    })
                    .with('daily_fleet', details => {
                         details.with('details', unit =>
                              unit.with('equipment')
                         )
                         details.with('shift')
                         details.with('activities')
                         details.with('fleet')
                         details.with('pit')
                    })
                    .where(whe => {
                         if (req.distance) {
                              whe.where('distance', req.distance)
                         }

                         if (req.material) {
                              whe.where('material', req.material)
                         }

                         if (req.exca_id) {
                              whe.where('exca_id', req.exca_id)
                         }

                         if (arrFilter.length > 0) {
                              whe.where('status', 'Y')
                              if (req.begin_date) {
                                   whe.where(
                                        'date',
                                        '>=',
                                        req.begin_date
                                   )
                                   whe.where(
                                        'date',
                                        '<=',
                                        req.end_date
                                   )
                              }
                              whe.whereIn('dailyfleet_id', arrFilter)
                         } else {
                              if (req.begin_date) {
                                   whe.where(
                                        'date',
                                        '>=',
                                        req.begin_date
                                   )
                                   whe.where(
                                        'date',
                                        '<=',
                                        req.end_date
                                   )
                              }
                              whe.where('status', 'Y')
                         }
                    })
                    .orderBy('date', 'desc')
                    .paginate(halaman, limit)
          } else {
               dailyRitase = await DailyRitase.query()
                    .with('material_details')
                    .with('ritase_details', item => {
                         item.with('checker', b => b.with('profile'))
                         item.with('spv', b => b.with('profile'))
                         item.with('hauler')
                         item.orderBy('created_at', 'desc')
                    })
                    .with('daily_fleet', details => {
                         details.with('details', unit =>
                              unit.with('equipment')
                         )
                         details.with('shift')
                         details.with('activities')
                         details.with('fleet')
                         details.with('pit')
                    })
                    .where('status', 'Y')
                    .orderBy('date', 'desc')
                    .paginate(halaman, limit)
          }
          return dailyRitase
     }

     async BY_PIT(params, req) {
          const limit = 25
          const halaman =
               req.page === undefined ? 1 : parseInt(req.page)
          const dailyRitaseDetail = await DailyRitaseDetail.query()
               .with('daily_ritase', a => {
                    a.with('daily_fleet', b => {
                         b.with('pit')
                         b.with('fleet')
                         b.with('shift')
                         b.where('pit_id', params.pit_id)
                    })
                    a.with('material_details')
               })
               .with('checker', b => b.with('profile'))
               .with('hauler')
               .orderBy('check_in', 'desc')
               .paginate(halaman, limit)
          return dailyRitaseDetail
     }

     async BY_FLEET(params, req) {
          const limit = 25
          const halaman =
               req.page === undefined ? 1 : parseInt(req.page)
          const dailyRitaseDetail = await DailyRitaseDetail.query()
               .with('daily_ritase', a => {
                    a.with('daily_fleet', b => {
                         b.with('pit')
                         b.with('fleet')
                         b.with('shift')
                         b.where('fleet_id', params.fleet_id)
                    })
                    a.with('material_details')
               })
               .with('checker', b => b.with('profile'))
               .with('hauler')
               .orderBy('check_in', 'desc')
               .paginate(halaman, limit)
          return dailyRitaseDetail
     }

     async BY_SHIFT(params, req) {
          const limit = 25
          const halaman =
               req.page === undefined ? 1 : parseInt(req.page)
          const dailyRitaseDetail = await DailyRitaseDetail.query()
               .with('daily_ritase', a => {
                    a.with('daily_fleet', b => {
                         b.with('pit')
                         b.with('fleet')
                         b.with('shift')
                         b.where('shift_id', params.shift_id)
                    })
                    a.with('material_details')
               })
               .with('checker', b => b.with('profile'))
               .with('hauler')
               .orderBy('check_in', 'desc')
               .paginate(halaman, limit)
          return dailyRitaseDetail
     }

     async BY_RIT_ID(req) {
          const limit = 25
          const halaman =
               req.page === undefined ? 1 : parseInt(req.page)
          const dailyRitaseDetail = await DailyRitaseDetail.query()
               .with('daily_ritase', wh => wh.where('id', req.id))
               .with('checker', b => b.with('profile'))
               .with('spv', b => b.with('profile'))
               .orderBy('check_in', 'desc')
               .paginate(halaman, limit)
          return dailyRitaseDetail
     }

     async ID_SHOW(params) {
          const dailyRitase = await DailyRitase.query()
               .with('material_details')
               .with('ritase_details', item => {
                    item.with('checker', b => b.with('profile'))
                    item.with('spv', b => b.with('profile'))
                    item.with('hauler')
               })
               .with('daily_fleet', details => {
                    details.with('details', unit =>
                         unit.with('equipment')
                    )
                    details.with('shift')
                    details.with('activities')
                    details.with('fleet')
                    details.with('pit')
               })
               .where('id', params.id)
               .first()
          return dailyRitase
     }

     async RITASE_BY_DAILY_ID(req) {
          const dailyRitaseDetail = await DailyRitaseDetail.query()
               .with('daily_ritase')
               .with('hauler')
               .with('checker', b => b.with('profile'))
               .with('spv', b => b.with('profile'))
               .where('dailyritase_id', req.id)
               .orderBy([
                    { column: 'hauler_id', order: 'desc' },
                    { column: 'check_in', order: 'desc' },
               ])
               .fetch()
          return dailyRitaseDetail
     }

     async POST_RITASE_OB(params, req) {
          const dailyRitase = await DailyRitase.find(params.id)
          try {
               dailyRitase.merge(req)
               await dailyRitase.save()
               return dailyRitase
          } catch (error) {
               return null
          }
     }

     async GET_HOURLY_PRODUCTION_OB(id, time) {
          let acc = 0
          const dailyRitaseDetails = await DailyRitaseDetail.query()
               .with('daily_ritase', wh => {
                    wh.with('material_details')
               })
               .where('dailyritase_id', id)
               .andWhere('check_in', '>=', time.data.start)
               .andWhere('check_in', '<=', time.data.end)
               .fetch()

          const totalValueOB = dailyRitaseDetails.toJSON().reduce(
               (a, b) => a + b.daily_ritase.material_details.vol,

               0
          )
          acc = {
               val: totalValueOB,
               totalRitase: dailyRitaseDetails.toJSON().length,
          }

          return acc
     }

     async GET_HOURLY_TARGET_BCM(pit_id, date) {
          const SoM = moment(date)
               .startOf('month')
               .format('YYYY-MM-DD HH:mm:ss')

          const monthlyPlansOB = await MonthlyPlans.query()
               .where('pit_id', pit_id)
               .andWhere('month', SoM)
               .andWhere('tipe', 'OB')
               .first()

          const dailyPlans = await DailyPlans.query()
               .where('current_date', date)
               .andWhere('monthlyplans_id', monthlyPlansOB.id)
               .first()

          /**
           * the number 22 is 24 hour minus by 2 hour (rest time 1 hour for both shift)
           */
          const hourlyTarget = parseInt(
               (parseInt(dailyPlans.estimate) / 22).toFixed(2)
          )
          return hourlyTarget
     }

     async GET_HOURLY_EXCEL_DATA(filePath, req, usr) {
          const xlsx = excelToJson({
               sourceFile: filePath,
               header: 1,
          })

          const sampleSheet = req.sheet || '07-08'
          // this is section where it is not a rotation data
          const getCoalRehandleIndex = xlsx[sampleSheet].findIndex(
               v => v.V === 'COAL REHANDLE'
          )

          const startIndexRotation = 210
          const spliced = xlsx[sampleSheet].splice(
               startIndexRotation,
               getCoalRehandleIndex
          )

          const shifts = (await MasShift.query().fetch()).toJSON()
          const currentTime = moment().format('YYYY-MM-DD HH:mm:ss')

          let result = []

          for (let shift of shifts) {
               const startShift = moment(
                    `${req.date} ${shift.start_shift}`
               ).format('YYYY-MM-DD HH:mm:ss')
               const endShift = moment(
                    `${req.date} ${shift.start_shift}`
               )
                    .add(shift.duration, 'hour')
                    .subtract(1, 'minute')
                    .format('YYYY-MM-DD HH:mm:ss')

               if (
                    new Date(currentTime) >= new Date(startShift) &&
                    new Date(currentTime) <= new Date(endShift)
               ) {
                    const currentShift = shift.kode

                    let data = []
                    for (let x of spliced) {
                         try {
                              if (currentShift === 'DS') {
                                   const obj = {
                                        excaName: x.V,
                                        hauler: x.W,
                                        bm: x.X || 0,
                                        ob: x.Y || 0,
                                        soil: x.Z || 0,
                                        mud: x.AA || 0,
                                        coal: x.AB || 0,
                                        pit: x.BF,
                                        distance: x.BG,
                                        totalMaterial: x.BH,
                                   }
                                   data.push(obj)
                              } else {
                                   const obj = {
                                        excaName: x.AC,
                                        hauler: x.AD,
                                        bm: x.AE || 0,
                                        ob: x.AF || 0,
                                        soil: x.AG || 0,
                                        mud: x.AH || 0,
                                        coal: x.AI || 0,
                                        pit: x.BI,
                                        distance: x.BJ,
                                        totalMaterial: x.BK,
                                   }

                                   data.push(obj)
                              }
                         } catch (err) {
                              throw new Error(err)
                         }
                    }

                    var date = moment(req.date).format('YYYY-MM-DD')

                    const __data__ = data.filter(
                         v =>
                              v.excaName &&
                              v.hauler &&
                              v.excaName !== 'COAL REHANDLE'
                    )

                    const excaNames = _.uniq(
                         __data__.map(v => v.excaName)
                    )

                    const haulers = []

                    for (const exca of excaNames) {
                         const obj = {
                              excaName: exca,
                              haulers: __data__.filter(
                                   x => x.excaName === exca
                              ),
                         }

                         haulers.push(obj)
                    }

                    console.log('haulers >> ', haulers)

                    for (const item of haulers) {
                         const excaNameFromExcel = (
                              await MasEquipment.query()
                                   .where('kode', item.excaName)
                                   .first()
                         ).toJSON()

                         if (
                              req.exca_id ===
                              String(excaNameFromExcel.id)
                         ) {
                              // OB MATERIAL / MASTER OB / GLOBAL OB MATERIAL
                              try {
                                   const dailyRitaseCheck =
                                        await DailyRitase.query()
                                             .where(wh => {
                                                  wh.where(
                                                       'dailyfleet_id',
                                                       req.dailyfleet_id
                                                  )
                                                  wh.andWhere(
                                                       'exca_id',
                                                       req.exca_id
                                                  )
                                                  wh.andWhere(
                                                       'material',
                                                       12
                                                  )
                                                  wh.andWhere(
                                                       'distance',
                                                       req.distance
                                                  )
                                                  wh.andWhere(
                                                       'date',
                                                       req.date
                                                  )
                                             })
                                             .first()


                                   let dailyRitase = null
                                   if (dailyRitaseCheck) {
                                        console.log('does this true')
                                       dailyRitase = dailyRitaseCheck
                                   } else {
                                        console.log('or false ')
                                        dailyRitase =
                                             new DailyRitase()
                                        dailyRitase.fill({
                                             dailyfleet_id:
                                                  req.dailyfleet_id,
                                             exca_id: req.exca_id,
                                             material: 12,
                                             distance: req.distance,
                                             date: req.date,
                                        })

                                        await dailyRitase.save()
                                   }

                                   for (const value of item.haulers) {
                                        const haulerId = (
                                             await MasEquipment.query()
                                                  .where(
                                                       'kode',
                                                       value.hauler
                                                  )
                                                  .first()
                                        ).toJSON()

                                        for (
                                             let index = 0;
                                             index <
                                             value.totalMaterial;
                                             index++
                                        ) {
                                             var clock = moment(
                                                  `${req.date} ${
                                                       sampleSheet.split(
                                                            '-'
                                                       )[0]
                                                  }`
                                             ).format('HH:mm:ss')
                                             const ritaseDetail =
                                                  new DailyRitaseDetail()
                                             ritaseDetail.fill({
                                                  dailyritase_id:
                                                       dailyRitase.id,
                                                  checker_id:
                                                       req.checker_id,
                                                  spv_id: req.spv_id,
                                                  hauler_id:
                                                       haulerId.id,
                                                  opr_id: null,
                                                  check_in:
                                                       date +
                                                       ' ' +
                                                       clock,
                                             })
                                             await ritaseDetail.save()
                                        }
                                   }

                                   let _result = (
                                        await DailyRitaseDetail.query()
                                             .with(
                                                  'daily_ritase',
                                                  wh => {
                                                       wh.with(
                                                            'material_details'
                                                       )
                                                  }
                                             )
                                             .with('checker', wh => {
                                                  wh.with('profile')
                                             })
                                             .with('spv', wh => {
                                                  wh.with('profile')
                                             })
                                             .where(
                                                  'dailyritase_id',
                                                  dailyRitase.id
                                             )
                                             .fetch()
                                   ).toJSON()

                                   result.push(_result)
                              } catch (err) {
                                   throw new Error(
                                        'Error OB >> ',
                                        err
                                   )
                              }
                         }
                    }

                    return result
               }
          }
     }

     async GET_HOURLY_EXCEL_DATA_v2(filePath, req, usr) {
          const xlsx = excelToJson({
               sourceFile: filePath,
               header: 1,
          })
          const sampleSheet = '07-08'
          // this is section where it is not a rotation data
          const getCoalRehandleIndex = xlsx[sampleSheet].findIndex(
               v => v.V === 'COAL REHANDLE'
          )

          const startIndexRotation = 210
          const spliced = xlsx[sampleSheet].splice(
               startIndexRotation,
               getCoalRehandleIndex
          )

          const shifts = (await MasShift.query().fetch()).toJSON()
          const currentTime = moment().format('YYYY-MM-DD HH:mm:ss')

          for (let shift of shifts) {
               const startShift = moment(
                    `${req.date} ${shift.start_shift}`
               ).format('YYYY-MM-DD HH:mm:ss')
               const endShift = moment(
                    `${req.date} ${shift.start_shift}`
               )
                    .add(shift.duration, 'hour')
                    .subtract(1, 'minute')
                    .format('YYYY-MM-DD HH:mm:ss')

               if (
                    new Date(currentTime) >= new Date(startShift) &&
                    new Date(currentTime) <= new Date(endShift)
               ) {
                    const currentShift = shift.kode

                    let data = []
                    for (let x of spliced) {
                         try {
                              if (currentShift === 'DS') {
                                   const obj = {
                                        excaName: x.V,
                                        hauler: x.W,
                                        bm: x.X || 0,
                                        ob: x.Y || 0,
                                        soil: x.Z || 0,
                                        mud: x.AA || 0,
                                        coal: x.AB || 0,
                                        pit: x.BE,
                                        distance: x.BF,
                                   }
                                   data.push(obj)
                              } else {
                                   const obj = {
                                        excaName: x.AC,
                                        hauler: x.AD,
                                        bm: x.AE || 0,
                                        ob: x.AF || 0,
                                        soil: x.AG || 0,
                                        mud: x.AH || 0,
                                        coal: x.AI || 0,
                                        pit: x.BG,
                                        distance: x.BH,
                                   }

                                   data.push(obj)
                              }
                         } catch (err) {
                              throw new Error(err)
                         }
                    }

                    try {
                         const pits = (
                              await MasPit.query()
                                   .where('sts', 'Y')
                                   .fetch()
                         ).toJSON()

                         // local methods
                         const GET_DATA_BY_PIT_NAME = pitName => {
                              let cleanData = data.filter(
                                   v =>
                                        v.excaName &&
                                        v.hauler &&
                                        v.excaName !== 'COAL REHANDLE'
                              )

                              const result = []
                              for (const data of cleanData) {
                                   if (data.pit === pitName) {
                                        result.push(data)
                                   }
                              }
                              return result
                         }

                         const GET_FLEET_ID_BY_PIT_ID = async (
                              id,
                              index
                         ) => {
                              const fleets = (
                                   await MasFleet.query()
                                        .where('pit_id', id)
                                        .andWhere('tipe', 'OB')
                                        .andWhere('status', 'Y')
                                        .fetch()
                              ).toJSON()

                              const data = []
                              for (const fleet of fleets) {
                                   data.push(fleet)
                              }

                              return data[index]
                         }
                         // end of local methods

                         const arrPit = []
                         for (const pit of pits) {
                              const dailyFleets = (
                                   await DailyFleet.query()
                                        .where('date', req.date)
                                        .andWhere(
                                             'shift_id',
                                             shift.id
                                        )
                                        .andWhere('pit_id', pit.id)
                                        .fetch()
                              ).toJSON()
                              const obj = {
                                   pitName: pit.name,
                                   pit_id: pit.id,
                                   data: GET_DATA_BY_PIT_NAME(
                                        pit.name
                                   ),
                                   dailyFleet: dailyFleets,
                              }
                              arrPit.push(obj)
                         }

                         for (const data of arrPit) {
                              if (
                                   data.data.length > 0 &&
                                   data.dailyFleet.length > 0
                              ) {
                                   // do somethin
                              } else {
                                   const excas = []
                                   // if not found let's create the daily fleet
                                   for (let exca of data.data) {
                                        excas.push(exca.excaName)
                                   }

                                   const uniqExca = _.uniq(excas)
                                   let idx = 0

                                   for (const exca of uniqExca) {
                                        const haulers = [
                                             exca,
                                             ...data.data
                                                  .filter(
                                                       v =>
                                                            v.excaName ===
                                                            exca
                                                  )
                                                  .map(v => v.hauler),
                                        ]
                                        idx += 1
                                        const df = new DailyFleet()

                                        df.fill({
                                             pit_id: data.pit_id,
                                             fleet_id: (
                                                  await GET_FLEET_ID_BY_PIT_ID(
                                                       data.pit_id,
                                                       idx - 1
                                                  )
                                             ).id,
                                             activity_id: 11, // loading ob
                                             shift_id: shift.id,
                                             tipe: 'MF', // main fleet
                                             user_id: usr.id,
                                             date: new Date(req.date),
                                        })

                                        await df.save()

                                        for (let equipment of haulers) {
                                             const equipData =
                                                  await MasEquipment.query()
                                                       .where(
                                                            'kode',
                                                            equipment
                                                       )
                                                       .first()

                                             const dailyFleetEquip =
                                                  new DailyFleetEquipment()

                                             dailyFleetEquip.fill({
                                                  dailyfleet_id:
                                                       df.id,
                                                  equip_id:
                                                       equipData.id,
                                                  datetime:
                                                       currentTime,
                                             })

                                             dailyFleetEquip.save()
                                        }

                                        const excaID =
                                             await MasEquipment.query()
                                                  .where('kode', exca)
                                                  .first()
                                        const rotationData =
                                             Object.values(
                                                  data.data[0]
                                             )
                                        // [ 'ME031', 'OHT043', 0, 2, 0, 0, 0, 'RPU', 1100 ]
                                        const blasting =
                                             rotationData[2]
                                        const ob = rotationData[3]
                                        const soil = rotationData[4]
                                        const mud = rotationData[5]
                                        const coal = rotationData[6]
                                        const distance =
                                             rotationData[8]

                                        if (blasting) {
                                             const dailyRitase =
                                                  new DailyRitase()
                                             const materialName =
                                                  await MasMaterial.query()
                                                       .where(
                                                            'name',
                                                            'Blasting'
                                                       )
                                                       .first()
                                             dailyRitase.fill({
                                                  dailyfleet_id:
                                                       df.id,
                                                  exca_id: excaID.id,
                                                  material:
                                                       materialName.id,
                                                  distance: distance,
                                                  date: req.date,
                                             })

                                             await dailyRitase.save()
                                        }

                                        if (ob) {
                                             const dailyRitase =
                                                  new DailyRitase()
                                             const materialName =
                                                  await MasMaterial.query()
                                                       .where(
                                                            'name',
                                                            'OB'
                                                       )
                                                       .first()
                                             dailyRitase.fill({
                                                  dailyfleet_id:
                                                       df.id,
                                                  exca_id: excaID.id,
                                                  material:
                                                       materialName.id,
                                                  distance: distance,
                                                  date: req.date,
                                             })

                                             await dailyRitase.save()
                                        }

                                        if (soil) {
                                             const dailyRitase =
                                                  new DailyRitase()
                                             const materialName =
                                                  await MasMaterial.query()
                                                       .where(
                                                            'name',
                                                            'Soil'
                                                       )
                                                       .first()
                                             dailyRitase.fill({
                                                  dailyfleet_id:
                                                       df.id,
                                                  exca_id: excaID.id,
                                                  material:
                                                       materialName.id,
                                                  distance: distance,
                                                  date: req.date,
                                             })

                                             await dailyRitase.save()
                                        }

                                        if (mud) {
                                             const dailyRitase =
                                                  new DailyRitase()
                                             const materialName =
                                                  await MasMaterial.query()
                                                       .where(
                                                            'name',
                                                            'Lumpur'
                                                       )
                                                       .first()
                                             dailyRitase.fill({
                                                  dailyfleet_id:
                                                       df.id,
                                                  exca_id: excaID.id,
                                                  material:
                                                       materialName.id,
                                                  distance: distance,
                                                  date: req.date,
                                             })

                                             await dailyRitase.save()
                                        }

                                        if (coal) {
                                             const dailyRitase =
                                                  new DailyRitase()
                                             const materialName =
                                                  await MasMaterial.query()
                                                       .where(
                                                            'name',
                                                            COAL
                                                       )
                                                       .first()
                                             dailyRitase.fill({
                                                  dailyfleet_id:
                                                       df.id,
                                                  exca_id: excaID.id,
                                                  material:
                                                       materialName.id,
                                                  distance: distance,
                                                  date: req.date,
                                             })

                                             await dailyRitase.save()

                                             const drDetail =
                                                  new DailyRitaseDetail()
                                        }
                                   }
                              }
                         }

                         const dailyRitase = new DailyRitase()
                         dailyRitase.fill({
                              dailyfleet_id: req.dailyfleet_id,
                              exca_id: req.exca_id,
                              material: req.material,
                              distance: req.distance,
                              date: req.date,
                         })

                         await dailyRitase.save()

                         var date = moment(req.date).format(
                              'YYYY-MM-DD'
                         )
                         for (const item of data) {
                              var clock = moment(item.E).format(
                                   'HH:mm'
                              )
                              const ritaseDetail =
                                   new DailyRitaseDetail()
                              ritaseDetail.fill({
                                   dailyritase_id: dailyRitase.id,
                                   checker_id: req.checker_id,
                                   spv_id: req.spv_id,
                                   hauler_id: item.A,
                                   opr_id:
                                        item.D != '#N/A'
                                             ? item.D
                                             : null,
                                   check_in: date + ' ' + clock,
                              })
                              await ritaseDetail.save()
                         }

                         let result = (
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
                                   .where(
                                        'dailyritase_id',
                                        dailyRitase.id
                                   )
                                   .fetch()
                         ).toJSON()

                         return result
                    } catch (err) {
                         throw new Error(err)
                    }
               }
          }
     }

     async GET_HOURLY_EXCEL_DATA_v3(filePath, req, usr) {
          const xlsx = excelToJson({
               sourceFile: filePath,
               header: 1,
          })
          const sampleSheet = '07-08'
          // this is section where it is not a rotation data
          const getCoalRehandleIndex = xlsx[sampleSheet].findIndex(
               v => v.V === 'COAL REHANDLE'
          )

          const startIndexRotation = 210
          const spliced = xlsx[sampleSheet].splice(
               startIndexRotation,
               getCoalRehandleIndex
          )

          const shifts = (await MasShift.query().fetch()).toJSON()
          const currentTime = moment().format('YYYY-MM-DD HH:mm:ss')

          let result = []

          for (let shift of shifts) {
               const startShift = moment(
                    `${req.date} ${shift.start_shift}`
               ).format('YYYY-MM-DD HH:mm:ss')
               const endShift = moment(
                    `${req.date} ${shift.start_shift}`
               )
                    .add(shift.duration, 'hour')
                    .subtract(1, 'minute')
                    .format('YYYY-MM-DD HH:mm:ss')

               if (
                    new Date(currentTime) >= new Date(startShift) &&
                    new Date(currentTime) <= new Date(endShift)
               ) {
                    const currentShift = shift.kode

                    let data = []
                    for (let x of spliced) {
                         try {
                              if (currentShift === 'DS') {
                                   const obj = {
                                        excaName: x.V,
                                        hauler: x.W,
                                        bm: x.X || 0,
                                        ob: x.Y || 0,
                                        soil: x.Z || 0,
                                        mud: x.AA || 0,
                                        coal: x.AB || 0,
                                        pit: x.BE,
                                        distance: x.BF,
                                   }
                                   data.push(obj)
                              } else {
                                   const obj = {
                                        excaName: x.AC,
                                        hauler: x.AD,
                                        bm: x.AE || 0,
                                        ob: x.AF || 0,
                                        soil: x.AG || 0,
                                        mud: x.AH || 0,
                                        coal: x.AI || 0,
                                        pit: x.BG,
                                        distance: x.BH,
                                   }

                                   data.push(obj)
                              }
                         } catch (err) {
                              throw new Error(err)
                         }
                    }

                    var date = moment(req.date).format('YYYY-MM-DD')

                    const __data__ = data.filter(
                         v =>
                              v.excaName &&
                              v.excaName !== 'COAL REHANDLE'
                    )

                    const excaNames = _.uniq(
                         __data__.map(v => v.excaName)
                    )

                    const haulers = []

                    for (const exca of excaNames) {
                         const obj = {
                              excaName: exca,
                              haulers: __data__.filter(
                                   x => x.excaName === exca
                              ),
                         }

                         haulers.push(obj)
                    }

                    for (let x of haulers) {
                         const excaNameFromExcel = (
                              await MasEquipment.query()
                                   .where('kode', x.excaName)
                                   .first()
                         ).toJSON()

                         if (
                              req.exca_id ===
                              String(excaNameFromExcel.id)
                         ) {
                              const tempArr = []
                              for (const y of x.haulers) {
                                   if (y.bm) {
                                        tempArr.push({
                                             excaName: x.excaName,
                                             materials: 'blasting',
                                             haulers: x.haulers.filter(
                                                  v => v.bm
                                             ),
                                        })
                                   }

                                   if (y.ob) {
                                        tempArr.push({
                                             excaName: x.excaName,
                                             materials: 'ob',
                                             haulers: x.haulers.filter(
                                                  v => v.ob
                                             ),
                                        })
                                   }

                                   if (y.mud) {
                                        tempArr.push({
                                             excaName: x.excaName,
                                             materials: 'mud',
                                             haulers: x.haulers.filter(
                                                  v => v.mud
                                             ),
                                        })
                                   }

                                   if (y.coal) {
                                        tempArr.push({
                                             excaName: x.excaName,
                                             materials: 'coal',
                                             haulers: x.haulers.filter(
                                                  v => v.coal
                                             ),
                                        })
                                   }
                              }
                         }
                    }

                    return result
               }
          }
     }
}

module.exports = new Ritase()
