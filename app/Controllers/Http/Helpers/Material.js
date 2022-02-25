"use strict";

const MasMaterial = use("App/Models/MasMaterial");
const DailyRitase = use("App/Models/DailyRitase");

class Material {
  async ALL(req) {
    let masMaterial;
    const halaman = req.page === undefined ? 1 : parseInt(req.page);
    const limit = 25;
    if (req.keyword) {
      masMaterial = await MasMaterial.query()
        .where((w) => {
          w.where("name", "like", `%${req.keyword}%`);
          orWhere("kode", "like", `%${req.keyword}%`);
        })
        .paginate(halaman, limit);
    } else {
      masMaterial = await MasMaterial.query().paginate(halaman, limit);
    }

    return masMaterial;
  }

  async GET_ID(params) {
    const masMaterial = await MasMaterial.query()
      .where("id", params.id)
      .first();
    return masMaterial;
  }

  async GET_COAL_ID(params) {
    const masMaterial = await MasMaterial.query().where("tipe", "BB").first();
    return masMaterial;
  }

  async POST(req) {
    const masMaterial = new MasMaterial();
    masMaterial.fill(req);
    await masMaterial.save();
    return masMaterial;
  }

  async UPDATE(params, req) {
    const masMaterial = await MasMaterial.query()
      .where("id", params.id)
      .first();
    masMaterial.merge(req);
    await masMaterial.save();
    return masMaterial;
  }

  async DELETE(params) {
    const masMaterial = await MasMaterial.query()
      .where("id", params.id)
      .first();
    await masMaterial.delete();
    return masMaterial;
  }

  async GET_MATERIAL_NAME_BY_MATERIAL_ID(id) {
    const materials = await MasMaterial.query().where("id", id).first();
    let materialName = materials.name.includes("/")
      ? materials.name.split("/")[0]
      : materials.name;

    return materialName;
  }
}

module.exports = new Material();
