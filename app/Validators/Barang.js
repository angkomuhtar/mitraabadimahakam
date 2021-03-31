'use strict'

class Barang {
    get rules () {
        return {
            bisnis_id: 'required',
            // gudang_id: 'required',
            // no_seri: 'required|unique:barangs, no_seri',
            no_seri: 'required',
            nm_barang: 'required',
            tipe: 'required',
            stn: 'required',
            // qty: 'required',
        }
    }

    get messages () {
        return {
            'bisnis_id.required': 'Bisnis Unit tdk boleh kosong...',
            // 'gudang_id.required': 'Gudang tdk boleh kosong...',
            'no_seri.required': 'No Serial atau Akun Kode tdk boleh kosong...',
            'no_seri.unique': 'No Seri atau Akun Kode harus uniq...',
            'nm_barang.required': 'Nama Barang tdk boleh kosong...',
            'tipe.required': 'Tipe Barang tdk boleh kosong...',
            'stn.required': 'Satuan Barang tdk boleh kosong...',
            // 'qty.required': 'Jumlah Barang tdk boleh kosong...'
        }
    }

    async fails (errorMessages) {
        console.log('errorMessages ', errorMessages)
        return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
    }
}

module.exports = Barang
