'use strict'

class AkunBank {
  get rules () {
    return {
      bisnis_id: 'required',
      nm_bank: 'required|max:100|min:3',
      no_rekening: 'required',
    }
  }

  get messages () {
    return {
      'bisnis_id.required': 'Unit Bisnis tdk boleh kosong...',
      'nm_bank.required': 'Nama Bank tdk boleh kosong...',
      'nm_bank.max': 'Nama Bank maximal 100 karakter...',
      'nm_bank.min': 'Nama Bank minimal 3 karakter...',
      'no_rekening.required': 'No. Rekening tdk boleh kosong...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = AkunBank
