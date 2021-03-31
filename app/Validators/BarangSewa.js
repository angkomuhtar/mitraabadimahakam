'use strict'

class BarangSewa {
  get rules () {
    return {
      bisnis_id: 'required',
      kode_unit: 'required',
      no_identity: 'required',
      nm_unit: 'required',
      tipe: 'required'
    }
  }

  get messages () {
    return {
      'bisnis_id.required': 'Unit Bisnis tdk boleh kosong...',
      'kode_unit.required': 'Kode Unit akun tdk boleh kosong...',
      'no_identity.required': 'Nomor Identity tdk boleh kosong...',
      'nm_unit.required': 'Nama Unit tdk boleh kosong...',
      'tipe.required': 'Tipe tdk boleh kosong...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = BarangSewa
