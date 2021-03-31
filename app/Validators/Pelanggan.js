'use strict'

class Pelanggan {
  get rules () {
    return {
      bisnis_id: 'required',
      name: 'required|max:100|min:3',
      email: 'required',
      phone: 'required',
      alamat_tagih: 'required|max:200',
      alamat_kirim: 'required|max:200',
    }
  }

  get messages () {
    return {
      'bisnis_id.required': 'Unit Bisnis tdk boleh kosong...',
      'name.required': 'Nama Pelanggan tdk boleh kosong...',
      'name.max': 'Nama Pelanggan maximal 100 karakter...',
      'name.min': 'Nama Pelanggan minimal 3 karakter...',
      'email.required': 'Email Pelanggan tdk boleh kosong...',
      'phone.required': 'No. Telepon Pelanggan tdk boleh kosong...',
      'alamat_tagih.required': 'Alamat Penagihan Pelanggan tdk boleh kosong...',
      'alamat_tagih.max': 'Alamat Penagihan Pelanggan maximal 200 karakter...',
      'alamat_kirim.required': 'Alamat Pengiriman Pelanggan tdk boleh kosong...',
      'alamat_kirim.max': 'Alamat Pengiriman Pelanggan maximal 200 karakter...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = Pelanggan
