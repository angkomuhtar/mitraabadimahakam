$(function(){
    initDefault()

    $('body').on('click', 'button#bt-back', function(){
        initDefault()
    })

    $('body').on('click', 'button#create-form', function(){
        initCreate()
    })

    $('body').on('click', 'button#create-form-details', function(){
        initCreateDetails()
    })

    $('body').on('click', 'button#bt-cancel-update', function(e){
        e.preventDefault()
        initDefault()
    })

    $('body').on('click', 'button.bt-edit-data', function(e){
        var id = $(this).data('id')
        initShow(id)
    })

    $('body').on('click', 'a#btPreviousPage', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var limit = $('body').find('input[name="limit-data"]').val()
        page = page <= 1 ? 1 : page - 1
        var limit = $('body').find('input[name="limit-data"]').val()
        var start_date = $('input[name="start_date"]').val() && '&start_date='+$('input[name="start_date"]').val()
        var end_date = $('input[name="end_date"]').val() && '&end_date='+$('input[name="end_date"]').val()
        var site = $('select[name="site_id"]').val() && '&site_id='+$('select[name="site_id"]').val()
        var pit = $('select[name="pit_id"]').val() && '&pit_id='+$('select[name="pit_id"]').val()
        var uri = '/operation/fuel-summary/list?page='+page+'&limit='+limit+start_date+end_date+site+pit
        initDefault(uri)
    })

    $('body').on('click', 'a#btNextPage', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var last = $(this).data('last')
        page = page >= last ? last : page + 1
        var limit = $('body').find('input[name="limit-data"]').val()
        var start_date = $('body').find('input[name="start_date"]').val() && '&start_date='+$('input[name="start_date"]').val()
        var end_date = $('body').find('input[name="end_date"]').val() && '&end_date='+$('input[name="end_date"]').val()
        var site = $('body').find('select[name="site_id"]').val() && '&site_id='+$('select[name="site_id"]').val()
        var pit = $('body').find('select[name="pit_id"]').val() && '&pit_id='+$('select[name="pit_id"]').val()
        var uri = '/operation/fuel-summary/list?page='+page+'&limit='+limit+start_date+end_date+site+pit
        initDefault(uri)
    })

    $('body').on('click', 'button#btGoToPage', function(e){
        e.preventDefault()
        var page = $('body').find('input[name="inp-page"]').val()
        var limit = $('body').find('input[name="limit-data"]').val()
        var start_date = $('body').find('input[name="start_date"]').val() && '&start_date='+$('input[name="start_date"]').val()
        var end_date = $('body').find('input[name="end_date"]').val() && '&end_date='+$('input[name="end_date"]').val()
        var site = $('body').find('select[name="site_id"]').val() && '&site_id='+$('select[name="site_id"]').val()
        var pit = $('body').find('select[name="pit_id"]').val() && '&pit_id='+$('select[name="pit_id"]').val()
        var uri = '/operation/fuel-summary/list?page='+page+'&limit='+limit+start_date+end_date+site+pit
        initDefault(uri)
    })

    $('body').on('click', '#btn-apply-filter', function(){
        var limit = $('input[name="limit-data"]').val()
        var start_date = $('input[name="start_date"]').val() && '&start_date='+$('input[name="start_date"]').val()
        var end_date = $('input[name="end_date"]').val() && '&end_date='+$('input[name="end_date"]').val()
        var site = $('select[name="site_id"]').val() && '&site_id='+$('select[name="site_id"]').val()
        var pit = $('select[name="pit_id"]').val() && '&pit_id='+$('select[name="pit_id"]').val()
        var uri = '/operation/fuel-summary/list?limit='+limit+start_date+end_date+site+pit
        initDefault(uri)
    })

    $('body').on('click', '#btn-reset-filter', function(){
        initDefault()
        $('select[name="site_id"]').val('')
        $('select[name="pit_id"]').val('')
        $('input[name="start_date"]').val('')
        $('input[name="end_date"]').val('')
    })

    // get the file data
    $('body').on('change', 'input[name="fuel_usage_summary"]', function(){
        var data = new FormData()
        
        data.append('fuel_usage_summary', $(this)[0].files[0])
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/fuel-summary/uploadFile',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            beforeSend: function(){
                swal("Please wait!", "Data sedang di proses...")
            },
            success: function(result){
                $('body').find('input[name="current_file_name"]').val(JSON.stringify(result.fileName, null, 2))
                
                swal("Okey!", "Excel data berhasil dibaca ....", "success")
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })


    $('body').on('submit', 'form#fm-upload-fuel-summary', function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        swal({
            title: "Apakah anda yakin akan melakukan upload data?",
            text: "",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-warning",
            confirmButtonText: "Okey!",
            closeOnConfirm: false
          },
          function(isConfirm){
            swal("Please wait.....")
              if(isConfirm){
                  $.ajax({
                      async: true,
                      headers: {'x-csrf-token': $('[name=_csrf]').val()},
                      url: '/operation/fuel-summary',
                      method: 'POST',
                      data: formData,
                      dataType: 'json',
                      processData: false,
                      mimeType: "multipart/form-data",
                      contentType: false,
                      success: function(result){
                          console.log(result)
                          if(result.success){
                            swal({
                                title: "Okey! " + result.message,
                                text: "Apakah anda akan kembali ke halaman \nLIST FUEL SUMMARY ?",
                                type: "success",
                                showCancelButton: true,
                                confirmButtonClass: "btn-success",
                                confirmButtonText: "Okey!",
                                closeOnConfirm: false
                              }, isExit => {
                                if(isExit){
                                    window.location.reload()
                                }
                              })
                          }else{
                              alert(result.message)
                          }
                      },
                      error: function(err){
                          swal("Opps,,,!", err, "warning")
                      }
                  })
              }else{
                swal("Okey!", 'you cancel upload data...', "success");
              }
        });

    })

    $('body').on('submit', 'form#fm-upload-fuel-summary-entry', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/fuel-summary/entry',
            method: 'POST',
            data: formData,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                if(result.success){
                  swal({
                      title: "Okey! " + result.message,
                      text: "Apakah anda akan kembali ke halaman \nLIST FUEL SUMMARY ?",
                      type: "success",
                      showCancelButton: true,
                      confirmButtonClass: "btn-success",
                      confirmButtonText: "Okey!",
                      closeOnConfirm: false
                    }, isExit => {
                      if(isExit){
                          window.location.reload()
                      }
                    })
                }else{
                    alert(result.message)
                }
            },
            error: function(err){
                swal("Opps,,,!", err, "warning")
            }
        })

    })

    $('body').on('submit', 'form#fm-update-fuel-summary', function(e) {
        e.preventDefault();
        var id = $(this).data('id')
        const formData = new FormData(this);

        swal({
            title: "Apakah anda yakin akan melakukan perubahan data?",
            text: "",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-warning",
            confirmButtonText: "Okey!",
            closeOnConfirm: false
          },
          function(isConfirm){
            swal("Please wait.....")
              if(isConfirm){
                  $.ajax({
                      async: true,
                      headers: {'x-csrf-token': $('[name=_csrf]').val()},
                      url: '/operation/fuel-summary/'+id+'/update',
                      method: 'POST',
                      data: formData,
                      dataType: 'json',
                      processData: false,
                      mimeType: "multipart/form-data",
                      contentType: false,
                      success: function(result){
                          console.log(result)
                          if(result.success){
                            swal({
                                title: "Okey! " + result.message,
                                text: "Apakah anda akan kembali ke halaman \nLIST FUEL SUMMARY ?",
                                type: "success",
                                showCancelButton: true,
                                confirmButtonClass: "btn-success",
                                confirmButtonText: "Okey!",
                                closeOnConfirm: false
                              }, isExit => {
                                if(isExit){
                                    window.location.reload()
                                }
                              })
                          }else{
                              alert(result.message)
                          }
                      },
                      error: function(err){
                          console.log('====================================');
                          console.log(err);
                          console.log('====================================');
                          const { message } = err.responseJSON
                          swal("Opps,,,!", err, "warning")
                      }
                  })
              }else{
                swal("Okey!", 'you cancel upload data...', "success");
              }
        });

    })

    function initDefault(queryParams){
        var uri = queryParams || '/operation/fuel-summary/list?limit='
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: uri,
            method: 'GET',
            success: function(result){
                $('content-module').css('display', 'none')
                $('div#list-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initCreate(){
        // $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/fuel-summary/create',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err)
            }
        })
    }

    function initShow(id){
        $.ajax({
            async: true,
            url: '/operation/fuel-summary/'+id+'/show',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err)
            }
        })
    }

    function ajaxSearch(value){
        var url = window.location.pathname+'/list?keyword='+value
        $.ajax({
            async: true,
            url: url,
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }
})

'2205171233001MDR007SPM'