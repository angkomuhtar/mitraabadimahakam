'use strict'

class employeeAdd {
  get rules () {
    return {
      fullname: 'required',
      sex: 'required',
      t4_lahir: 'required',
      tgl_lahir: 'required',
      tipe_employee: 'required',
      sts_employee: 'required',
      join_date: 'required',
      phone: 'required',
      email: 'required'
    }
  }

  get messages () {
      return {
        'fullname.required': 'Nama Lengkap tdk boleh kosong...',
        'sex.required': 'Jenis Kelamin tdk boleh kosong...',
        't4_lahir.required': 'Tempat lahir tdk boleh kosong...',
        'tgl_lahir.required': 'Tanggal lahir tdk boleh kosong...',
        'tipe_employee.required': 'Tipe employee tdk boleh kosong...',
        'sts_employee.required': 'Status employee tdk boleh kosong...',
        'join_date.required': 'Tanggal gabung tdk boleh kosong...',
        'phone.required': 'No. Handphone tdk boleh kosong...',
        'email.required': 'Email tdk boleh kosong...',
      }
  }

  async fails (errorMessages) {
      console.log('errorMessages ', errorMessages)
      return this.ctx.response.status(404).json({success: false, message: errorMessages[0].message})
  }
}

module.exports = employeeAdd
