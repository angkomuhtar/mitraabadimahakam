'use strict'

const Issue = use('App/Models/MamIssue')
const moment = require('moment')
const MasShift = use('App/Models/MasShift')

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

     async SHOW_BY_DATE(params) {

          const shifts = (await MasShift.query().fetch()).toJSON()
          const date = moment(params.date).format('YYYY-MM-DD')

          const limit = parseInt(params.limit) || 100
          const halaman =
          params.page === undefined ? 1 : parseInt(params.page)

          for (const x of shifts) {
               const currentShiftStart = moment(
                    `${date} ${x.start_shift}`
               ).format('YYYY-MM-DD HH:mm:ss')
               const currentShiftEnd = moment(
                    `${date} ${x.start_shift}`
               )
                    .add(x.duration, 'hour')
                    .format('YYYY-MM-DD HH:mm:ss')

               const currentDate = moment(params.date).format(
                    'YYYY-MM-DD HH:mm:ss'
               )

               if (
                    new Date(currentDate) >=
                         new Date(currentShiftStart) &&
                    new Date(currentDate) <= new Date(currentShiftEnd)
               ) {
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
                              .paginate(halaman, limit)
                    ).toJSON()

                    return data

                    // data.arrUnit = data.unit.map(el => el.id)
               }
          }
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
