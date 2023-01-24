$(function(){
    $('body').on('submit', 'form#fm-submit-edit-budget-pa', function (e) {
        e.preventDefault()
        const formData = new FormData(this)
        swal(
          {
            title: 'Apakah anda yakin?',
            text: 'Pastikan Anda memilih bulan dengan benar!',
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
                url: '/operation/equipment-performance',
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
                    $('body form#fm-submit-equipment-performance').trigger('reset')
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
})