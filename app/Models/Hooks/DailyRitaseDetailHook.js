"use strict";

const moment = require("moment");
const DailyPlan = use("App/Models/DailyPlan");
const DailyFleet = use("App/Models/DailyFleet");
const MonthlyPlan = use("App/Models/MonthlyPlan");
const DailyRitase = use("App/Models/DailyRitase");
const MasMaterial = use("App/Models/MasMaterial");
const MasEquipment = use("App/Models/MasEquipment");
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail");

const DailyRitaseDetailHook = (exports = module.exports = {});

DailyRitaseDetailHook.beforeInsertData = async (dailyritasedetail) => {
  const counter = await DailyRitaseDetail.query()
    .where({
      hauler_id: dailyritasedetail.hauler_id,
      dailyritase_id: dailyritasedetail.dailyritase_id,
    })
    .getCount()
  dailyritasedetail.urut = counter + 1;

  const lastData = await DailyRitaseDetail.query()
    .where({
      hauler_id: dailyritasedetail.hauler_id,
      dailyritase_id: dailyritasedetail.dailyritase_id,
    })
    .last();

  dailyritasedetail.duration = lastData
    ? moment.duration(moment().diff(moment(lastData.check_in))).as("minutes")
    : -1;

  const dailyRitase = await DailyRitase.findOrFail(
    dailyritasedetail.dailyritase_id
  );
  const totalRitase = await DailyRitaseDetail.query()
    .where("dailyritase_id", dailyritasedetail.dailyritase_id)
    .getCount();
  dailyRitase.merge({ tot_ritase: totalRitase });
  await dailyRitase.save();
};

DailyRitaseDetailHook.afterInsertData = async (dailyritasedetail) => {
  const dailyRitase = await DailyRitase.findOrFail(
    dailyritasedetail.dailyritase_id
  );
  const totalRitase = await DailyRitaseDetail.query()
    .where("dailyritase_id", dailyritasedetail.dailyritase_id)
    .getCount();
  dailyRitase.merge({ tot_ritase: totalRitase });
  await dailyRitase.save();

  /* GET HAULER TYPE (SFI OR REGULAR OHT )*/
  const hauler = await MasEquipment.findOrFail(dailyritasedetail.hauler_id);

  /* GET VOLUME MATERIAL */
  const volume = await MasMaterial.query()
    .where("id", dailyRitase.material)
    .last();

  /* GET PIT ID */
  const GET_PIT_ID = (await DailyRitase.query()
    .where("id", dailyritasedetail.dailyritase_id)
    .first()).toJSON()

  /* GET MONTLY PLAN */
  const awalBulan = moment(dailyritasedetail.check_in).startOf('month').format('YYYY-MM-DD HH:mm:ss')

  
  const montlyPlan = await MonthlyPlan.query()
    .where((w) => {
      w.where("pit_id", GET_PIT_ID.pit_id)
      w.where('month', awalBulan)
      w.where("tipe", "OB")
    })
    .last()

  /* GET PLAN DATE */
  const date = moment(dailyritasedetail.check_in).format("YYYY-MM-DD")
  const dailyPlan = await DailyPlan.query()
    .where((w) => {
      w.where("current_date", date)
      w.where("monthlyplans_id", montlyPlan.id)
    })
    .first()



  /** check whether this is a OHT or SFI */
  const regTest = /SFI/i;
  const regTest2 = /MDT/i;
  const equipmentName = hauler.kode;
  const checkIfSFIType = regTest.test(equipmentName);
  const checkMDTType = regTest2.test(equipmentName)

  if (checkIfSFIType) {
    dailyPlan.merge({
      actual: parseFloat(dailyPlan.actual) + parseFloat(hauler.qty_capacity),
    })
  }
 
  // because mdt can only handle 9tonnes
  if(checkMDTType) {
    dailyPlan.merge({
      actual: parseFloat(dailyPlan.actual) + 9,
    })
  }

    dailyPlan.merge({
      actual: parseFloat(dailyPlan.actual) + parseFloat(volume.vol)
    })
  
  
  await dailyPlan.save();
};

DailyRitaseDetailHook.afterDeleteData = async (dailyritasedetail) => {
  const dailyRitase = await DailyRitase.findOrFail(
    dailyritasedetail.dailyritase_id
  );
  const totalRitase = await DailyRitaseDetail.query()
    .where("dailyritase_id", dailyritasedetail.dailyritase_id)
    .getCount();
  dailyRitase.merge({ tot_ritase: totalRitase });
  await dailyRitase.save();

  /* GET CAPACITY HAULER */
  const hauler = await MasEquipment.findOrFail(dailyritasedetail.hauler_id);

  /* GET VOLUME MATERIAL */
  const volume = await MasMaterial.query()
    .where("id", dailyRitase.material)
    .last()

  /* GET PLAN DATE */
  const date = moment(dailyritasedetail.check_in).format("YYYY-MM-DD");
  const dailyPlan = await DailyPlan.query().where("current_date", date).first();
  dailyPlan.merge({
    actual: parseFloat(dailyPlan.actual) - parseFloat(volume.vol),
  });
  await dailyPlan.save();
};

DailyRitaseDetailHook.beforeUpdateData = async (dailyritasedetail) => {
  const lastData = await DailyRitaseDetail.query()
    .where({
      hauler_id: dailyritasedetail.hauler_id,
      dailyritase_id: dailyritasedetail.dailyritase_id,
    })
    .last();

  dailyritasedetail.duration = lastData
    ? moment.duration(moment().diff(moment(lastData.check_in))).as("minutes")
    : -1

  const dailyRitase = await DailyRitase.findOrFail(
    dailyritasedetail.dailyritase_id
  )
  const totalRitase = await DailyRitaseDetail.query()
    .where("dailyritase_id", dailyritasedetail.dailyritase_id)
    .getCount();
  dailyRitase.merge({ tot_ritase: totalRitase });
  await dailyRitase.save();
};
