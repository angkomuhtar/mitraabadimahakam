"use strict";

const UserDevice = use("App/Models/UserDevice");
const User = use("App/Models/User");
const DailyFleet = use("App/Models/DailyFleet");
const { sendMessage } = use("App/Controllers/Http/customClass/utils");

class Notifications {
  async sendNotifications(req, date, result, checkerName) {
    const owner = (
      await User.query().where("user_tipe", "owner").last()
    ).toJSON();

    const ownerDevices = (
      await UserDevice.query().where("user_id", owner?.id).fetch()
    ).toJSON();

    if (ownerDevices) {
      const hours = moment(data[0].E).add(3, "minutes").format("HH:mm");
      const excaName = (
        await MasEquipment.query().where("id", req.exca_id).first()
      ).toJSON().kode;

      const pitName = (
        await DailyFleet.query()
          .with("pit")
          .where("id", req.dailyfleet_id)
          .first()
      ).toJSON().pit.name;
      const materialName = (
        await MasMaterial.query().where("id", req.material).first()
      ).toJSON().name;

      const start = moment(`${date} ${hours}`).startOf("hour").format("HH:mm");
      const end = moment(`${date} ${hours}`).endOf("hour").format("HH:mm");

      const totalBCM =
        result.reduce((a, b) => a + b.daily_ritase.material_details.vol, 0) ||
        0;
      let msg = `Hourly Report OB ${start} - ${end} | ${moment(date).format(
        "DD MMM"
      )}
          ${pitName} - ${excaName} - ${materialName}
           BCM : ${await numberFormatter(String(totalBCM))}
           Author : ${checkerName}
          `;

      const data = {};

      for (const x of ownerDevices) {
        await sendMessage(x.playerId, msg, data, x.platform);
      }
    }
  }
}
