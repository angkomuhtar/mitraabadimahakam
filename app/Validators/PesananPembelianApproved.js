'use strict'
var _ = require('underscore')

class PesananPembelianApproved {
    get rules () {
        return {
            // akun_id: 'required',
            // supplier_id: 'required',
            qty_acc: 'required|min:1',
            metode_bayar: 'required'
        }
    }

    get messages () {
        return {
            // 'akun_id.required': 'Akun tdk boleh kosong...',
            // 'supplier_id.required': 'Supplier tdk boleh kosong...',
            'qty_acc.required': 'Jumlah ACC Pesanan tdk boleh kosong...',
            'qty_acc.min': 'Jumlah ACC Pesanan tdk boleh kosong...',
            'metode_bayar.required': 'Metode Bayar tdk boleh kosong...'
        }
    }

    async fails (errorMessages) {
        console.log('errorMessages ', errorMessages)
        return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
    }
}

module.exports = PesananPembelianApproved
