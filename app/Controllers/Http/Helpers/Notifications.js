'use strict'

const UserDevice = use('App/Models/UserDevice')
const User = use('App/Models/User')
const DailyFleet = use('App/Models/DailyFleet')
const { sendMessage } = use('App/Controllers/Http/customClass/utils')
const MasEquipment = use('App/Models/MasEquipment')
const MasEvent = use('App/Models/MasEvent')
const MasShift = use('App/Models/MasShift')
const MasSite = use('App/Models/MasSite')

const moment = require('moment')
const { numberFormatter } = require('../customClass/utils')
class Notifications {
     async sendNotifications(req, date, result, checkerName) {
          const owner = (
               await User.query()
                    .whereIn('user_tipe', ['owner', 'manager'])
                    .fetch()
          ).toJSON()

          for (const x of owner) {
               const ownerDevices = (
                    await UserDevice.query()
                         .where('user_id', x?.id)
                         .fetch()
               ).toJSON()

               if (ownerDevices) {
                    const hours = moment(data[0].E)
                         .add(3, 'minutes')
                         .format('HH:mm')
                    const excaName = (
                         await MasEquipment.query()
                              .where('id', req.exca_id)
                              .first()
                    ).toJSON().kode

                    const pitName = (
                         await DailyFleet.query()
                              .with('pit')
                              .where('id', req.dailyfleet_id)
                              .first()
                    ).toJSON().pit.name
                    const materialName = (
                         await MasMaterial.query()
                              .where('id', req.material)
                              .first()
                    ).toJSON().name

                    const start = moment(`${date} ${hours}`)
                         .startOf('hour')
                         .format('HH:mm')
                    const end = moment(`${date} ${hours}`)
                         .endOf('hour')
                         .format('HH:mm')

                    const totalBCM =
                         result.reduce(
                              (a, b) =>
                                   a +
                                   b.daily_ritase.material_details
                                        .vol,
                              0
                         ) || 0
                    let msg = `Hourly Report OB ${start} - ${end} | ${moment(
                         date
                    ).format('DD MMM')}
            ${pitName} - ${excaName} - ${materialName}
             BCM : ${await numberFormatter(String(totalBCM))}
             Author : ${checkerName}
            `

                    const data = {}

                    for (const x of ownerDevices) {
                         await sendMessage(
                              x.playerId,
                              msg,
                              data,
                              x.platform
                         )
                    }
               }
          }
     }

     async sendNotificationsIssue(
          unitId,
          eventId,
          desc,
          startAt,
          endAt,
          checkerId
     ) {
          console.log(
               unitId,
               eventId,
               desc,
               startAt,
               endAt,
               checkerId
          )
          const owner = (
               await User.query()
                    .whereIn('user_tipe', ['owner', 'manager'])
                    .fetch()
          ).toJSON()

          const unitName = await MasEquipment.query()
               .where('id', unitId)
               .first()

          let eventName = null

          if (eventId) {
               eventName = (
                    await MasEvent.query()
                         .where('id', eventId)
                         .first()
               ).narasi
          }

          const checkerName = (
               await User.query()
                    .with('profile')
                    .where('id', checkerId)
                    .first()
          ).toJSON()?.profile?.nm_depan

          console.log('checker name >> ', checkerName)

          for (const x of owner) {
               const ownerDevices = (
                    await UserDevice.query()
                         .where('user_id', x?.id)
                         .fetch()
               ).toJSON()

               if (ownerDevices) {
                    let msg = `
                    Daily Issue Report
                    Unit Name : ${unitName.kode} - ${
                         unitName.unit_model
                    }
                    Type of Issue : ${eventName || 'Tidak Ada'}
                    Description : ${desc || 'Tidak Ada'} 
                    Start Issue : ${moment(startAt).format(
                         'DD, MMM YYYY HH:mm'
                    )}
                    End Issue : ${
                         endAt
                              ? moment(endAt).format(
                                     'DD, MMM YYYY HH:mm'
                                )
                              : 'Belum diketahui'
                    }

                    Author : ${checkerName}
            `

                    const data = {}

                    for (const x of ownerDevices) {
                         await sendMessage(
                              x.playerId,
                              msg,
                              data,
                              x.platform
                         )
                    }
               }
          }
     }

     async sendNotificationsRefueling(
          pitName,
          siteId,
          checkerId,
          totalTopup,
          tgl,
          totalUnit
     ) {
          const owner = (
               await User.query()
                    .whereIn('user_tipe', ['owner', 'manager'])
                    .fetch()
          ).toJSON()

          const siteName = (
               await MasSite.query().where('id', siteId).first()
          ).toJSON()
          const checkerName = (
               await User.query()
                    .with('profile')
                    .where('id', checkerId)
                    .first()
          ).toJSON()?.profile

          for (const x of owner) {
               const ownerDevices = (
                    await UserDevice.query()
                         .where('user_id', x?.id)
                         .fetch()
               ).toJSON()

               if (ownerDevices) {
                    let msg = `
                    Daily Refueling Report

                    PIT Name : ${pitName}
                    Site Name : ${siteName.name}
                    Total Topup : ${await numberFormatter(
                         String(totalTopup)
                    )} L
                    Total Unit : ${totalUnit} UNIT

                    Fueling At : ${moment(tgl).format('DD MMM YYYY')}
                    Author : ${checkerName.nm_depan} ${
                         checkerName?.nm_belakang || null
                    }
            `

                    const data = {}

                    for (const x of ownerDevices) {
                         await sendMessage(
                              x.playerId,
                              msg,
                              data,
                              x.platform
                         )
                    }
               }
          }
     }
}

module.exports = new Notifications()
