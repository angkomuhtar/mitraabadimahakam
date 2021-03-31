'use strict'

class Gudang {
  get rules () {
    return {
      bisnis_id: 'required',
      cabang_id: 'required',
      name: 'required|max:100|min:3',
      email: 'required',
      phone: 'required',
      alamat: 'required|max:200',
    }
  }

  get messages () {
    return {
      'bisnis_id.required': 'Unit Bisnis tdk boleh kosong...',
      'cabang_id.required': 'Cabang tdk boleh kosong...',
      'name.required': 'Nama Karyawan tdk boleh kosong...',
      'name.max': 'Nama Karyawan maximal 100 karakter...',
      'name.min': 'Nama Karyawan minimal 3 karakter...',
      'email.required': 'Email Karyawan tdk boleh kosong...',
      'phone.required': 'No. Telepon Karyawan tdk boleh kosong...',
      'alamat.required': 'Alamat Karyawan tdk boleh kosong...',
      'alamat.max': 'Alamat Karyawan maximal 200 karakter...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = Gudang
