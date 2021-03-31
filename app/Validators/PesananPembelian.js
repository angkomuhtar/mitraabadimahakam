'use strict'
var _ = require('underscore')

class PesananPembelian {
    get rules () {
        return {
            bisnis_id: 'required',
            tgl_pesanan: 'required',
            keterangan: 'required'
        }
    }

    // get data () {
    //     const requestBody = this.ctx.request.all()
    //     const data = {
    //         arrBarang: this.ctx.request.all().barang_id,
    //         arrKeterangan: this.ctx.request.all().keterangan_dtl
    //     }
    //     data.arrBarang.map((elm, i) => {
    //         if(elm === '' && data.arrKeterangan[i] === ''){
    //             console.log('^^^^^^^^', i)
    //             return this.ctx.response.status(404).json({success: false, message: 'Entry data ke'+i + 1+' tdk valid...'})
    //         }else{
    //             // return Object.assign({}, requestBody, { sessionId })
    //             return this.ctx.response.status(404).json({success: false, message: 'Entry data ke'+i + 1+' tdk valid...'})

    //         }
    //     })
    // }

    get messages () {
        return {
            'bisnis_id.required': 'Bisnis Unit tdk boleh kosong...',
            'tgl_pesanan.required': 'Tanggal Pesanan tdk boleh kosong...',
            'keterangan.required': 'Keterangan tdk boleh kosong...'
        }
    }

    async fails (errorMessages) {
        console.log('errorMessages ', errorMessages)
        return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
    }
}

module.exports = PesananPembelian
