'use strict'

const MasFuel = use("App/Models/MasFuel")
const MasFuelAgen = use("App/Models/MasFuelAgen")


class Fuels {
    async ALL_FUEL (req) {
        const masFuel = await MasFuel.all()
    }
}

module.exports = new Fuels()