$(function () {
    initDefault()
    // getAllPit()
    // getAllEvent();
    // getAllShift()
  
    $('body').on('click', 'button#bt-back', function () {
      initDefault()
    })
  
    $('body').on('click', 'button#create-form', function () {
      initCreate()
      // getAllPit()
      // getAllEvent();
      // getAllShift()
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
      initShow(id)
    })
  
    $('body').on('change', 'select#fitur_id', function () {
      var values = $(this).val()
      var desc = $(this)
        .find('option[value="' + values + '"]')
        .data('desc')
      $('textarea[name="desc"]').val(desc)
    })
  
    $('#filterModal').on('hidden.bs.modal', function (e) {
      var body = $('body')
      var page = $('input[name="inp-page"]').val()
      var status = body.find('select[name="status"]').val()
      var site_id = body.find('select[name="site_id"]').val()
      var equip_id = body.find('select[name="equip_idx"]').val()
      var begin_date = body.find('input[name="begin_date"]').val()
      var end_date = body.find('input[name="end_date"]').val()
      $.ajax({
        async: true,
        url: '/operation/daily-downtime/list',
        method: 'GET',
        dataType: 'html',
        data: {
          limit: 50,
          page: page,
          site_id: site_id,
          equip_id: equip_id,
          downtime_status: status,
          breakdown_start: begin_date,
          breakdown_finish: end_date
        },
        success: function (result) {
          $('content-module').css('display', 'none')
          $('div#list-content').html(result).show()
        },
        error: function (err) {
          console.log(err)
        },
      })
    })
  
    $('body').on('change', 'select[name="sts_approve"]', function () {
      const value = $(this).val()
      if (value === 'no') {
        $('body').find('div#approved_date_div').addClass('hidden')
        $('body').find('input[name="approved_date"]').removeAttr('required')
        $('body').find('input[name="approved_date"]').val('')
      } else {
        $('body').find('div#approved_date_div').removeClass('hidden')
      }
    })

    // get the file data
    $('body').on('change', 'input[name="daily_downtime_upload"]', function () {
      var data = new FormData()
      data.append('daily_downtime_upload', $(this)[0].files[0])
      $.ajax({
        async: true,
        headers: { 'x-csrf-token': $('[name=_csrf]').val() },
        url: '/operation/daily-downtime/uploadFile',
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
          $('body')
            .find('select[name="sheet"]')
            .html(result.title.map(s => '<option value="' + s + '"> Sheet [ ' + s + ' ]</option>'))
          $('body').find('select[name="sheet"]').prepend('<option value="" selected> Pilih </option>')
          swal('Okey!', 'Data Excel Berhasil dibaca ....', 'success')
        },
        error: function (err) {
          console.log(err)
          const { message } = err.responseJSON
          swal('Opps,,,!', message, 'warning')
        },
      })
    })
  
    $('body').on('submit', 'form#fm-create-stoppage-issue', function (e) {
      e.preventDefault()
  
      const formData = new FormData(this)
    
      swal(
        {
          title: 'Apakah anda yakin?',
          text: 'Pastikan data yang anda input sudah benar!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonClass: 'btn-warning',
          confirmButtonText: 'Okey!',
          closeOnConfirm: true,
        },
        function (isConfirm) {
          if (isConfirm) {
            $.ajax({
              async: true,
              headers: { 'x-csrf-token': $('[name=_csrf]').val() },
              url: '/operation/daily-stoppage-issue',
              method: 'POST',
              data: formData,
              dataType: 'json',
              processData: false,
              mimeType: 'multipart/form-data',
              contentType: false,
              beforeSend: function(){
                $('body').find('div#div-row-form').css('display', 'none')
                $('body').find('div#spinner').toggleClass('hidden')
              },
              success: function (result) {
                console.log(result)
                $('body').find('div#spinner').toggleClass('hidden')
                $('body').find('div#div-row-form').css('display', 'block')
                if (result.success) {
                  swal('Okey!', result.message, 'success')
                  $('body form#fm-upload-daily-downtime').trigger('reset')
                  //   window.location.reload()
                } else {
                  alert(result.message)
                }
              },
              error: function (err) {
                $('body').find('div#spinner').toggleClass('hidden').html('Please reload pages....')
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
        url: '/operation/daily-stoppage-issue/list?limit=',
        method: 'GET',
        success: function (result) {
          $('content-module').css('display', 'none')
          $('div#list-content').html(result).show()
        },
        error: function (err) {
          console.log(err)
        },
      })
    }
  
    function initCreate() {
      // $('div.content-module').css('display', 'none')
      $.ajax({
        async: true,
        url: '/operation/daily-stoppage-issue/create',
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
        url: '/operation/daily-stoppage-issue/' + id + '/show',
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
  
  })
  