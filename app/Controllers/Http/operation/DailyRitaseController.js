"use strict";

const db = use("Database");
const moment = use("moment");
const Helpers = use("Helpers");
const _ = require("underscore");
const DailyRitase = use("App/Models/DailyRitase");
const TimeSheet = use("App/Models/DailyChecklist");
const excelToJson = require("convert-excel-to-json");
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail");
const DailyRitaseHelpers = use("App/Controllers/Http/Helpers/DailyRitase");
const { sendMessage, numberFormatter } = use(
  "App/Controllers/Http/customClass/utils"
);
const UserDevice = use("App/Models/UserDevice");
const User = use("App/Models/User");
const MasEquipment = use("App/Models/MasEquipment");
const DailyFleet = use("App/Models/DailyFleet");
const MasMaterial = use("App/Models/MasMaterial");
class DailyRitaseController {
  async index({ view }) {
    return view.render("operation.daily-ritase-ob.index");
  }

  async list({ request, view }) {
    const req = request.all();
    try {
      const dailyRitase = (await DailyRitaseHelpers.ALL(req)).toJSON();
      return view.render("operation.daily-ritase-ob.list", {
        list: dailyRitase,
        limit: req.limit || 25,
      });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async create({ view, auth }) {
    try {
      await auth.getUser();
      return view.render("operation.daily-ritase-ob.create");
    } catch (error) {
      console.log(error);
    }
  }

  async store({ request, auth }) {
    const req = request.all();
    try {
      await auth.getUser();
    } catch (error) {
      console.log(error);
    }

    const validateFile = {
      types: ["xls", "xlsx"],
      size: "2mb",
      types: "application",
    };

    const uploadData = request.file("detail-ritase-ob", validateFile);

    let aliasName;

    if (uploadData) {
      aliasName = `detail-ritase-ob-${moment().format("DDMMYYHHmmss")}.${
        uploadData.extname
      }`;

      await uploadData.move(Helpers.publicPath(`/upload/`), {
        name: aliasName,
        overwrite: true,
      });

      if (!uploadData.moved()) {
        return uploadData.error();
      }

      var pathData = Helpers.publicPath(`/upload/`);

      const convertJSON = excelToJson({
        sourceFile: `${pathData}${aliasName}`,
        header: {
          rows: 1,
        },
        sheets: ["FORM"],
      });

      const data = convertJSON.FORM.filter((cell) => cell.A != "#N/A");

      try {
        const dailyRitase = new DailyRitase();
        dailyRitase.fill({
          dailyfleet_id: req.dailyfleet_id,
          exca_id: req.exca_id,
          material: req.material,
          distance: req.distance,
          date: req.date,
        });

        await dailyRitase.save();

        var date = moment(req.date).format("YYYY-MM-DD");
        for (const item of data) {
          var clock = moment(item.E).format("HH:mm");
          const ritaseDetail = new DailyRitaseDetail();
          ritaseDetail.fill({
            dailyritase_id: dailyRitase.id,
            checker_id: req.checker_id,
            spv_id: req.spv_id,
            hauler_id: item.A,
            opr_id: item.D != "#N/A" ? item.D : null,
            check_in: date + " " + clock,
          });
          await ritaseDetail.save();
        }

        let result = (
          await DailyRitaseDetail.query()
            .with("daily_ritase", (wh) => {
              wh.with("material_details");
            })
            .with("checker", (wh) => {
              wh.with("profile");
            })
            .with("spv", (wh) => {
              wh.with("profile");
            })
            .where("dailyritase_id", dailyRitase.id)
            .fetch()
        ).toJSON();

        /** after being uploaded, then throw a notif to the company's owner */
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

          const start = moment(`${date} ${hours}`)
            .startOf("hour")
            .format("HH:mm");
          const end = moment(`${date} ${hours}`).endOf("hour").format("HH:mm");

          const totalBCM =
            result.reduce(
              (a, b) => a + b.daily_ritase.material_details.vol,
              0
            ) || 0;
          let msg = `Hourly Report OB ${start} - ${end} | ${moment(date).format('DD MMM')}
        ${pitName} - ${excaName} - ${materialName}
         BCM : ${await numberFormatter(String(totalBCM))}
        `;

          const _dat = {};

          for (const x of ownerDevices) {
            await sendMessage(x.playerId, msg, _dat, x.platform);
          }
        }

        return {
          success: true,
          data: result,
          message: "data berhasil di upload " + result.length + " items...",
        };
      } catch (error) {
        console.log(error);
        return {
          success: false,
          message: error,
        };
      }
    }
  }

  async listByPIT({ params, request, view }) {
    const req = request.only(["page", "limit"]);
    try {
      const dailyRitase = await DailyRitaseHelpers.BY_PIT(params, req);
      return view.render("operation.daily-ritase-ob.list-by", {
        list: dailyRitase.toJSON(),
        filtered: "pit",
        id: params.pit_id,
      });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async listByFLEET({ params, request, view }) {
    const req = request.only(["page", "limit"]);
    try {
      const dailyRitase = await DailyRitaseHelpers.BY_FLEET(params, req);

      return view.render("operation.daily-ritase-ob.list-by", {
        list: dailyRitase.toJSON(),
        filtered: "fleet",
        id: params.fleet_id,
      });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async listBySHIFT({ params, request, view }) {
    const req = request.only(["page", "limit"]);
    try {
      const dailyRitase = await DailyRitaseHelpers.BY_SHIFT(params, req);
      return view.render("operation.daily-ritase-ob.list-by", {
        list: dailyRitase.toJSON(),
        filtered: "shift",
        id: params.shift_id,
      });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async update({ params, request }) {
    const req = JSON.parse(request.raw());
    try {
      await DailyRitaseHelpers.POST_RITASE_OB(params, req);
      return {
        success: true,
        message: "success update data....",
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "failed update data....",
      };
    }
  }

  async listUnitByRitase({ request, view }) {
    const req = request.all();
    const dailyRitase = await DailyRitaseHelpers.RITASE_BY_DAILY_ID(req);
    let data = dailyRitase.toJSON();
    const timeSheet = (
      await TimeSheet.query().with("operator_unit").fetch()
    ).toJSON();

    for (let [i, item] of data.entries()) {
      const xx = _.find(
        timeSheet,
        (x) =>
          x.dailyfleet_id === item.daily_ritase.dailyfleet_id &&
          x.unit_id === item.hauler_id
      );
      if (xx) {
        data[i] = { ...item, operator: xx.operator_unit.fullname };
      } else {
        data[i] = { ...item, operator: "not set" };
      }
    }
    return view.render("operation.daily-ritase-ob.show-detais-ritase", {
      list: data,
    });
  }

  async show({ params, view }) {
    try {
      const dailyRitase = await DailyRitaseHelpers.ID_SHOW(params);
      return view.render("operation.daily-ritase-ob.show", {
        data: dailyRitase.toJSON(),
      });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async updateDetails({ params, request }) {
    const { id } = params;
    const req = request.all();
    const dailyRitaseDetail = await DailyRitaseDetail.find(id);
    dailyRitaseDetail.merge(req);
    console.log(dailyRitaseDetail.toJSON());
    try {
      await db
        .table("daily_ritase_details")
        .where("id", id)
        .update(dailyRitaseDetail.toJSON());
      return {
        success: true,
        message: "success update details....",
      };
    } catch (error) {
      return {
        success: false,
        message: "failed update details....",
      };
    }
  }

  async detailDestroy({ params, request }) {
    const { id } = params;
    const dailyRitaseDetail = await DailyRitaseDetail.find(id);
    try {
      await dailyRitaseDetail.delete();
      return {
        success: true,
        message: "success delete details....",
      };
    } catch (error) {
      return {
        success: false,
        message: "failed delete details....",
      };
    }
  }

  async test({ params, request, response }) {
    await sendMessage();
  }
}

module.exports = DailyRitaseController;
