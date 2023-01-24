'use strict'

const moment = require('moment')
const DailyRitaseCoal = use('App/Models/DailyRitase')
const DailyFleet = use('App/Models/DailyFleet')

const DailyRitaseCoalHook = (exports = module.exports = {})

DailyRitaseCoalHook.beforeInsertData = async dailyritase => {
     const check = await DailyFleet.query()
          .with('pit', wh => wh.with('site'))
          .with('shift')
          .where('id', dailyritase.dailyfleet_id)
          .last()

     if (check) {
          const data = check.toJSON();
          dailyritase.site_id = data.pit.site.id;
          dailyritase.pit_id = data.pit.id;
     }
}
