'use strict'

class AkunGroup {
  get rules () {
    return {
      bisnis_unit: 'required',
      nm_group: 'required',
      akun_kelompok_id: 'required',
      level: 'required'
    }
  }

  get messages () {
    return {
      'bisnis_unit.required': 'Unit Bisnis tdk boleh kosong...',
      'nm_group.required': 'Nama Group Akun tdk boleh kosong...',
      'akun_kelompok_id.required': 'Nama Kelompok Akun tdk boleh kosong...',
      'level.required': 'Induk group Akun tdk boleh kosong...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = AkunGroup
