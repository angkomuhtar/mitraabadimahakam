'use strict'

const Issue = use('App/Models/MamIssue')
const moment = require('moment')
const MasShift = use('App/Models/MasShift')
const MasSite = use('App/Models/MasSite')

class dailyIssue {
     async ALL(req) {
          const limit = parseInt(req.limit) || 100
          const halaman =
               req.page === undefined ? 1 : parseInt(req.page)
          console.log(limit)
          let data
          if (req.keyword) {
               data = await Issue.query()
                    .with('user')
                    .with('dailyevent', w => w.with('event'))
                    .with('unit')
                    .where(w => {
                         if (req.event_id) {
                              w.where('event_id', req.event_id)
                         }
                         if (req.issue) {
                              w.where(
                                   'issue',
                                   'like',
                                   `%${req.issue}%`
                              )
                         }
                         if (req.unit_id) {
                              w.whereIn('unit_id', req.unit_id)
                         }
                    })
                    .orderBy('report_at', 'desc')
                    .paginate(halaman, limit)
          } else {
               data = await Issue.query()
                    .with('user')
                    .with('dailyevent', w => w.with('event'))
                    .with('unit')
                    .orderBy('report_at', 'desc')
                    .paginate(halaman, limit)
          }

          return data
     }

     async POST(req, user) {
          try {
               const issue = new Issue()
               issue.fill(req)
               await issue.save()
               return {
                    success: true,
                    message: 'Success save data...',
               }
          } catch (error) {
               console.log(error)
               return {
                    success: false,
                    message:
                         'Failed save data...' +
                         JSON.stringify(error),
               }
          }
     }

     async SHOW(params) {
          const data = (
               await Issue.query()
                    .with('user')
                    .with('dailyevent', w => w.with('event'))
                    .with('unit')
                    .where('id', params.id)
                    .last()
          ).toJSON()
          // data.arrUnit = data.unit.map(el => el.id)
          console.log(data)
          return data
     }

     async SHOW_TODAY(){
          const data = (await Issue.
          query().
          with('user').
          with('dailyevent', w => w.with('event')).
          with('unit').
          where( w => {
               w.where('report_at', '>=', moment().startOf('day').format('YYYY-MM-DD HH:mm'))
               w.where('report_at', '<=', moment().endOf('day').format('YYYY-MM-DD HH:mm'))
          }).
          orderBy('report_at', 'desc').
          fetch()).toJSON()

          let result = []

          for (const obj of data) {
               if(obj.unit){
                    const site = await MasSite.query().where('id', obj.unit.site_id).last()
                    result.push({...obj, kd_site: site.kode, nm_site: site.name})
               }else{
                    result.push(obj)
               }
          }


          return result
     }

     async SHOW_BY_DATE(params) {
          const shifts = (await MasShift.query().fetch()).toJSON()
          const date = moment(params.date).format('YYYY-MM-DD')

          const limit = parseInt(params.limit) || 100
          const halaman =
               params.page === undefined ? 1 : parseInt(params.page)

          for (const x of shifts) {
               let currentShiftStart = moment(
                    `${date} ${x.start_shift}`
               ).format('YYYY-MM-DD HH:mm:ss')
               let currentShiftEnd = moment(
                    `${date} ${x.start_shift}`
               )
                    .add(x.duration, 'hour')
                    .format('YYYY-MM-DD HH:mm:ss')

               const currentDate = moment(params.date).format(
                    'YYYY-MM-DD HH:mm:ss'
               )

               const hour_check_1 = moment(params.date).format(
                    'HH:mm'
               )
               const hour_check_2 =
                    moment(currentShiftEnd).format('HH:mm')

               const day_check_1 = moment(params.date).format('DD')
               const day_check_2 =
                    moment(currentShiftEnd).format('DD')

               if (
                    day_check_1 !== day_check_2 &&
                    hour_check_1 === hour_check_2
               ) {
                    currentShiftStart = moment(`${currentShiftStart}`)
                         .subtract(x.duration * shifts.length, 'hour')
                         .format('YYYY-MM-DD HH:mm:ss')

                    currentShiftEnd = moment(
                         `${date} ${x.start_shift}`
                    )
                         .subtract(x.duration, 'hour')
                         .subtract(1, 'minutes')
                         .format('YYYY-MM-DD HH:mm:ss')
               }

               if (
                    new Date(currentDate) >=
                         new Date(currentShiftStart) &&
                    new Date(currentDate) <= new Date(currentShiftEnd)
               ) {
                    let hours = Array.from(
                         { length: x.duration + 1 },
                         (a, y) => {
                              return moment(
                                   `${date} ${x.start_shift}`
                              )
                                   .add(60 * y, 'minutes')
                                   .format('YYYY-MM-DD HH:mm:ss')
                         }
                    )

                    let hoursArr = []
                    for (let i = 1; i < hours.length; i++) {
                         const obj = {
                              data: {
                                   start: moment(hours[i])
                                        .subtract(1, 'hour')
                                        .subtract(1, 'minutes')
                                        .format(
                                             'YYYY-MM-DD HH:mm:ss'
                                        ),
                                   end: moment(hours[i])
                                        .subtract(2, 'minutes')
                                        .format(
                                             'YYYY-MM-DD HH:mm:ss'
                                        ),
                              },
                         }
                         hoursArr.push(obj)
                    }

                    let result = []
                    let data = (
                         await Issue.query()
                              .with('user')
                              .with('dailyevent', w =>
                                   w.with('event')
                              )
                              .with('unit')
                              .where(
                                   'report_at',
                                   '>=',
                                   currentShiftStart
                              )
                              .andWhere(
                                   'report_at',
                                   '<=',
                                   currentShiftEnd
                              )
                              .orderBy('report_at', 'desc')
                              .fetch()
                    ).toJSON()

                    for (const y of hoursArr) {
                         const objData = {
                              hourStart: y.data.start,
                              hourEnd: y.data.end,
                              data: data.filter(
                                   v =>
                                        new Date(v.report_at) >=
                                             new Date(y.data.start) &&
                                        new Date(v.report_at) <=
                                             new Date(y.data.end)
                              ),
                         }
                         result.push(objData)
                    }

                    console.log('result >> ', result)

                    return result

                    // data.arrUnit = data.unit.map(el => el.id)
               }
          }
     }

     async SHOW_LOG_HOURLY(req) {

          const { pit_id, start_at, end_at } = req;

          console.log('req >> ', req)
          const data = (await Issue.
               query().
               with('user').
               with('dailyevent', w => w.with('event')).
               with('unit').
               where( w => {
                    w.where('pit_id', pit_id)
                    w.where('report_at', '>=', moment(start_at).format('YYYY-MM-DD HH:mm:ss'))
                    w.where('report_at', '<=', moment(end_at).format('YYYY-MM-DD HH:mm:ss'))
               }).
               orderBy('report_at', 'desc').
               fetch()).toJSON()

               let result = []
               for (const value of data) {
                    // create the obj
                    const obj = {
                         start_at : (value.report_at && moment(value.report_at).format('HH:mm')) || null,
                         end_at : (value.end_at && moment(value.end_at).format('HH:mm')) || null,
                         event_name : value.dailyevent.event.narasi
                    }
                    result.push(obj)
               }
               return result
     }

     // async DELETE(params){
     //     const eventTimeSheet = await EventTimeSheet.find(params.dailyEventID)
     //     if(eventTimeSheet){
     //         await eventTimeSheet.delete()
     //         return eventTimeSheet
     //     }else{
     //         throw new Error('Data daily event ID ::'+params.dailyEventID+' not found...')
     //     }
     // }
}

module.exports = new dailyIssue()
