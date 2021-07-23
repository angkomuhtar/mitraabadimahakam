'use strict'

const MasFuel = use("App/Models/MasFuel")
const MasFuelAgen = use("App/Models/MasFuelAgen")


class Fuels {
    async ALL_FUEL (req) {
        const masFuel = await MasFuel.all()
        return masFuel
    }

    async FUEL_AGEN (req) {
        const masFuelAgen = await MasFuelAgen.all()
        return masFuelAgen
    }
}

module.exports = new Fuels()