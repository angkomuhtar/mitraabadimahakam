$(function () {
  initDefault()

  $('body').on('click', 'button#bt-back', function () {
    initDefault()
  })

  $('body').on('click', 'button#create-form', function () {
    initCreate()
  })

  $('body').on('click', 'button#create-form-details', function () {
    initCreateDetails()
  })

  $('body').on('click', 'button#bt-cancel-update', function (e) {
    e.preventDefault()
    initDefault()
  })

  $('body').on('click', 'button.bt-edit', function (e) {
    var id = $(this).data('id')
    initShow(id)
  })

  $('body').on('click', 'button.bt-edit-data', function (e) {
    var id = $(this).data('id')
    initShowDetails(id)
  })

  $('body').on('change', 'select#fitur_id', function () {
    var values = $(this).val()
    var desc = $(this)
      .find('option[value="' + values + '"]')
      .data('desc')
    $('textarea[name="desc"]').val(desc)
  })

  // $('body').on('submit', 'form#fm-doc', function(e){
  //     e.preventDefault()
  //     var data = new FormData(this)
  //     $.ajax({
  //         async: true,
  //         url: '/operation/sop',
  //         method: 'POST',
  //         data: data,
  //         dataType: 'json',
  //         processData: false,
  //         mimeType: "multipart/form-data",
  //         contentType: false,
  //         success: function(result){
  //             console.log(result)
  //             const { message } = result
  //             if(result.success){
  //                 swal("Okey,,,!", message, "success")
  //                 initDefault()
  //             }else{
  //                 swal("Opps,,,!", message, "warning")
  //             }
  //         },
  //         error: function(err){
  //             console.log(err)
  //             const { message } = err.responseJSON
  //             swal("Opps,,,!", message, "warning")
  //         }
  //     })
  // })

  // $('body').on('submit', 'form#fm-doc-upd', function(e){
  //     e.preventDefault()
  //     var id = $(this).data('id')
  //     var data = new FormData(this)
  //     $.ajax({
  //         async: true,
  //         url: '/operation/sop/'+id+'/update',
  //         method: 'POST',
  //         data: data,
  //         dataType: 'json',
  //         processData: false,
  //         mimeType: "multipart/form-data",
  //         contentType: false,
  //         success: function(result){
  //             console.log(result)
  //             const { message } = result
  //             if(result.success){
  //                 swal("Okey,,,!", message, "success")
  //                 initDefault()
  //             }else{
  //                 swal("Opps,,,!", message, "warning")
  //             }
  //         },
  //         error: function(err){
  //             console.log(err)
  //             const { message } = err.responseJSON
  //             swal("Opps,,,!", message, "warning")
  //         }
  //     })
  // })

  $('body').on('click', 'a.btn-pagging', function (e) {
    e.preventDefault()
    var page = $(this).data('page')
    var keyword = $('input#inpKeyworddoc').val()
    var url = window.location.pathname + '/list?page=' + page + '&keyword=' + keyword
    $.ajax({
      async: true,
      url: url,
      method: 'GET',
      success: function (result) {
        $('div#form-content-details').children().remove()
        $('div#list-content').html(result).show()
      },
      error: function (err) {
        console.log(err)
      },
    })
  })

  $('body').on('change', 'select[name="sts_approve"]', function () {

    const value = $(this).val()

    if(value === 'no') {
        $('body').find('div#approved_date_div').addClass('hidden')
        $('body').find('input[name="approved_date"]').removeAttr('required')
        $('body').find('input[name="approved_date"]').val('')
    } else {
        $('body').find('div#approved_date_div').removeClass('hidden')
    }


  })
  // get the file data
  $('body').on('change', 'input[name="sop_file"]', function () {
    var data = new FormData()

    data.append('sop_file', $(this)[0].files[0])
    $.ajax({
      async: true,
      headers: { 'x-csrf-token': $('[name=_csrf]').val() },
      url: '/operation/sop/uploadFile',
      method: 'POST',
      data: data,
      dataType: 'json',
      processData: false,
      mimeType: 'multipart/form-data',
      contentType: false,
      beforeSend: function () {
        swal('Please wait!', 'Data sedang di proses...')
      },
      success: function (result) {
        $('body').find('input[name="current_file_name"]').val(JSON.stringify(result.fileName, null, 2))
        swal('Okey!', 'PDF SOP Berhasil dibaca ....', 'success')
      },
      error: function (err) {
        console.log(err)
        const { message } = err.responseJSON
        swal('Opps,,,!', message, 'warning')
      },
    })
  })

  $('body').on('submit', 'form#fm-upload-sop', function (e) {
    e.preventDefault()

    const formData = new FormData(this)

    swal(
      {
        title: 'Apakah anda yakin?',
        text: 'Pastikan Format yang anda upload sudah benar!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn-warning',
        confirmButtonText: 'Okey!',
        closeOnConfirm: false,
      },
      function (isConfirm) {
        swal('Please wait.....')
        if (isConfirm) {
          $.ajax({
            async: true,
            headers: { 'x-csrf-token': $('[name=_csrf]').val() },
            url: '/operation/sop/store',
            method: 'POST',
            data: formData,
            dataType: 'json',
            processData: false,
            mimeType: 'multipart/form-data',
            contentType: false,
            success: function (result) {
              console.log(result)
              if (result.success) {
                swal('Okey!', result.message, 'success')
                $('body form#ffm-upload-sop').trigger('reset')
                //   window.location.reload()
              } else {
                alert(result.message)
              }
            },
            error: function (err) {
              console.log('error upload >> ', JSON.stringify(err))
              const { message } = err.responseJSON
              swal('Opps,,,!', message, 'warning')
            },
          })
        } else {
          swal('Okey!', 'you cancel upload data...', 'success')
        }
      }
    )
  })

  function initDefault() {
    $('div.content-module').css('display', 'none')
    $.ajax({
      async: true,
      url: '/operation/sop/list?limit=',
      method: 'GET',
      success: function (result) {
        $('content-module').css('display', 'none')
        getDepartmentNames()
        $('div#list-content').html(result).show()
      },
      error: function (err) {
        console.log(err)
      },
    })
  }

  function getDepartmentNames() {
      $.ajax({
          async : true,
          url : '/ajax/department',
          method : 'GET',
          success : function(result) {
            $('body').find('select[name="department"]').html(result.data.map(s => '<option value="'+s.teks+'"> '+s.teks+' </option>'))
            $('body').find('select[name="department"]').prepend('<option value="" selected> Pilih </option>')
          },
          error : function(err) {
              console.log('error while getting department data >> ', err);
          }
      })
  }

  function initCreate() {
    // $('div.content-module').css('display', 'none')
    $.ajax({
      async: true,
      url: '/operation/sop/create',
      method: 'GET',
      success: function (result) {
        $('div#list-content').children().remove()
        $('div#form-content').html(result).show()
      },
      error: function (err) {
        console.log(err)
      },
    })
  }

  function initShow(id) {
    $.ajax({
      async: true,
      url: '/operation/sop/' + id + '/show',
      method: 'GET',
      success: function (result) {
        $('div#list-content').children().remove()
        $('div#form-content').html(result).show()
      },
      error: function (err) {
        console.log(err)
      },
    })
  }

  function ajaxSearch(value) {
    var url = window.location.pathname + '/list?keyword=' + value
    $.ajax({
      async: true,
      url: url,
      method: 'GET',
      success: function (result) {
        $('div#list-content').children().remove()
        $('div#list-content').html(result).show()
      },
      error: function (err) {
        console.log(err)
      },
    })
  }
})
