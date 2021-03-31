'use strict'

class PersediaanBarang {
    get rules () {
        return {
            barang_id: 'required',
            harga_beli: 'required',
            harga_jual: 'required'
        }
    }

    get messages () {
        return {
            'barang_id.required': 'Nama Barang tdk boleh kosong...',
            'harga_beli.required': 'Harga Beli tdk boleh kosong...',
            'harga_jual.required': 'Harga Jual tdk boleh kosong...',
        }
    }

    async fails (errorMessages) {
        console.log('errorMessages ', errorMessages)
        return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
    }
}

module.exports = PersediaanBarang
