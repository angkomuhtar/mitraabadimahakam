"use strict";

const MasEquipment = use("App/Models/MasEquipment");
const DailyTimeSheet = use("App/Models/DailyChecklist");

class EquipmentList {
  async ALL(req) {
    // await equipUnit() commented
    let equipment;
    if (req.keyword) {
      equipment = await MasEquipment.query()
        .where((word) => {
          word.where("kode", "like", `%${req.keyword}%`);
          word.orWhere("brand", "like", `%${req.keyword}%`);
          word.orWhere("tipe", "like", `%${req.keyword}%`);
          word.orWhere("unit_model", "like", `%${req.keyword}%`);
        })
        .andWhere({ aktif: "Y" })
        .orderBy("kode", "asc")
        .fetch();
    } else {
      equipment = await MasEquipment.query()
        .where({ aktif: "Y" })
        .orderBy("kode", "asc")
        .fetch();
    }

    return equipment;
  }

  async FUEL_TRUCK() {
    const data = await MasEquipment.query()
      .where({ aktif: "Y", tipe: "fuel truck" })
      .orderBy("urut", "asc")
      .fetch();
    return data;
  }

  async EXCAVATOR() {
    const data = await MasEquipment.query()
      .where({ aktif: "Y", tipe: "excavator" })
      .orderBy("urut", "asc")
      .fetch();
    return data;
  }

  async HAULER() {
    const data = await MasEquipment.query()
      .where({ aktif: "Y", tipe: "hauler truck" })
      .orderBy("urut", "asc")
      .fetch();
    return data;
  }

  async LAST_SMU(req) {
    const equipment = await DailyTimeSheet.query()
      .with("equipment")
      .with("userCheck")
      .where("unit_id", req)
      .orderBy("end_smu", "desc")
      .first();
    return equipment;
  }

  async GET_EQUIPMENT_NAME_BY_ID(id) {
    const equipments = await MasEquipment.query().where("id", id).first();
    const equipmentName = equipments.kode;
    return equipmentName;
  }
}

module.exports = new EquipmentList();
