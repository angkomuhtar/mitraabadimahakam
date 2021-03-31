'use strict'

class Menudetails {
  get rules () {
    return {
      menumain_id: 'required',
      subname: 'required',
      uri: 'required',
      icon: 'required',
      urut: 'required'
    }
  }

  get messages () {
    return {
      'required': '{{ field }} tidak boleh kosong.'
    }
  }

  async fails (errorMessages) {
    this.ctx.session.flash({ notification: 'error' })
    this.ctx.session.withErrors(errorMessages).flashAll()
    console.log('errorMessages ', errorMessages)
    return this.ctx.response.redirect('back')
  }
}

module.exports = Menudetails
