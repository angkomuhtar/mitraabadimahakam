'use strict'

class Akun {
  get rules () {
    return {
      bisnis_id: 'required',
      akun_kelompok_id: 'required',
      nm_akun: 'required',
    }
  }

  get messages () {
    return {
      'bisnis_id.required': 'Unit Bisnis tdk boleh kosong...',
      'akun_kelompok_id.required': 'Kelompok akun tdk boleh kosong...',
      'nm_akun.required': 'Nama Akun tdk boleh kosong...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = Akun
