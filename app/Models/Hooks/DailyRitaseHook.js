'use strict'

const moment = require('moment')
const DailyRitase = use('App/Models/DailyRitase')
const DailyFleet = use('App/Models/DailyFleet')
const DailyRitaseDetail = use('App/Models/DailyRitaseDetail')

const DailyRitaseHook = (exports = module.exports = {})

DailyRitaseHook.beforeInsertData = async dailyritase => {
     const check = await DailyFleet.query()
          .with('pit', wh => wh.with('site'))
          .with('shift')
          .where('id', dailyritase.dailyfleet_id)
          .last()

     if (check) {
          const data = check.toJSON();

          dailyritase.site_id = data.pit.site.id;
          dailyritase.shift_id = data.shift.id;
          dailyritase.pit_id = data.pit.id;


     }
}
