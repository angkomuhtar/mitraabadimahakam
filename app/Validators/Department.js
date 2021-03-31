'use strict'

class Department {
  get rules () {
    return {
      bisnis_id: 'required',
      kode: 'required|max:3|min:3',
      name: 'required|max:100|min:3',
    }
  }

  get messages () {
    return {
      'bisnis_id.required': 'Unit Bisnis tdk boleh kosong...',
      'name.required': 'Nama Department tdk boleh kosong...',
      'name.max': 'Nama Department maximal 100 karakter...',
      'name.min': 'Nama Department minimal 3 karakter...',
      'kode.required': 'Nama Department tdk boleh kosong...',
      'kode.max': 'Kode Department maximal 3 karakter...',
      'kode.min': 'Kode Department minimal 3 karakter...',
    }
  }

  async fails (errorMessages) {
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = Department
