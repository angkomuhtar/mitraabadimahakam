'use strict'

class Gudang {
  get rules () {
    return {
      bisnis_id: 'required',
      kd_gudang: 'required|max:10|min:3',
      nm_gudang: 'required|max:100|min:3',
      email: 'required',
      phone: 'required',
      alamat: 'required|max:200',
    }
  }

  get messages () {
    return {
      'bisnis_id.required': 'Unit Bisnis tdk boleh kosong...',
      'kd_gudang.required': 'Kode Gudang tdk boleh kosong...',
      'kd_gudang.max': 'Kode Gudang maximal 10 karakter...',
      'kd_gudang.min': 'Kode Gudang minimal 3 karakter...',
      'nm_gudang.required': 'Nama Gudang tdk boleh kosong...',
      'nm_gudang.max': 'Nama Gudang maximal 100 karakter...',
      'nm_gudang.min': 'Nama Gudang minimal 3 karakter...',
      'email.required': 'Email Gudang tdk boleh kosong...',
      'phone.required': 'No. Telepon Gudang tdk boleh kosong...',
      'alamat.required': 'Alamat Penagihan Pelanggan tdk boleh kosong...',
      'alamat.max': 'Alamat Gudang maximal 200 karakter...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = Gudang
