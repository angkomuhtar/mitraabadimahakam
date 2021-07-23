'use strict'

const MasFuel = use("App/Models/MasFuel")
const MasFuelAgen = use("App/Models/MasFuelAgen")
const MamFuelDist = use("App/Models/MamFuelDist")


class Fuels {
    async ALL_FUEL (req) {
        const masFuel = await MasFuel.all()
        return masFuel
    }

    async FUEL_AGEN (req) {
        const masFuelAgen = await MasFuelAgen.all()
        return masFuelAgen
    }

    async FUEL_DIST_LIST (req) {
        const limit = 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        let data = []
        console.log('req.keyword::', req.keyword);
        if(req.keyword){
            data = await MamFuelDist
                .query()
                .with('site')
                .with('agen')
                .with('fuel')
                .where(w => {
                    w.where('no_do', 'like', `%${req.keyword}%`)
                    .orWhere('no_so', 'like', `%${req.keyword}%`)
                    .orWhere('no_plat', 'like', `%${req.keyword}%`)
                    .orWhere('seal_top', 'like', `%${req.keyword}%`)
                    .orWhere('seal_bott1', 'like', `%${req.keyword}%`)
                    .orWhere('seal_bott2', 'like', `%${req.keyword}%`)
                    .orWhere('recipient', 'like', `%${req.keyword}%`)
                    .orWhere('mengetahui', 'like', `%${req.keyword}%`)
                    .orWhere('truck_driver', 'like', `%${req.keyword}%`)
                })
                .paginate(halaman, limit)
        }else{
            data = await MamFuelDist.query().with('site').with('agen').with('fuel').paginate(halaman, limit)
        }

        return data
    }
}

module.exports = new Fuels()