'use strict'

class Supplier {
  get rules () {
    return {
      bisnis_id: 'required',
      name: 'required|max:100|min:3',
      email: 'required',
      alamat: 'required|max:200',
    }
  }

  get messages () {
    return {
      'bisnis_id.required': 'Unit Bisnis tdk boleh kosong...',
      'name.required': 'Nama Pemasok tdk boleh kosong...',
      'name.max': 'Nama Pemasok maximal 100 karakter...',
      'name.min': 'Nama Pemasok minimal 3 karakter...',
      'email.required': 'Email pemasok tdk boleh kosong...',
      'alamat.required': 'Alamat pemasok tdk boleh kosong...',
      'alamat.max': 'Alamat pemasok maximal 200 karakter...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = Supplier
