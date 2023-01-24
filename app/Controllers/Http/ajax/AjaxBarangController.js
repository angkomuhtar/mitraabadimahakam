'use strict'

const BarangHelpers = use("App/Controllers/Http/Helpers/Barang")
const VendorHelpers = use("App/Controllers/Http/Helpers/Supplier")

class AjaxBarangController {
    async getBarang ({ request }) {
        const req = request.all()
        const barang = (await BarangHelpers.ALL(req)).toJSON()
        const data = barang.data.map(item => item.id === parseInt(req.selected) ? {...item, selected: 'selected'} : {...item, selected: ''})
        return data
    }

    async getBarangDetails ({ params }) {
        const barang = (await BarangHelpers.GET_ID(params))?.toJSON()
        return barang
    }
    
    async getVendorDetails ( { params } ) {
        const vendor = (await VendorHelpers.GET_ID(params))?.toJSON()
        return vendor

    }
}

module.exports = AjaxBarangController
