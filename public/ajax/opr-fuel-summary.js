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

    $('body').on('click', 'button.bt-edit', function(e){
        var id = $(this).data('id')
        initShow(id)
    })

    $('body').on('click', 'button.bt-edit-data', function(e){
        var id = $(this).data('id')
        initShowDetails(id)
    })

    $('body').on('change', 'select#fitur_id', function(){
        var values = $(this).val()
        var desc = $(this).find('option[value="'+values+'"]').data('desc')
        $('textarea[name="desc"]').val(desc)
    })

    $('body').on('click', 'a.btn-pagging', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var keyword = $('input#inpKeyworddoc').val()
        var url = window.location.pathname+'/list?page='+page+'&keyword='+keyword
        $.ajax({
            async: true,
            url: url,
            method: 'GET',
            success: function(result){
                $('div#form-content-details').children().remove()
                $('div#list-content').html(result).show()
            },
            error: function(err){
                console.log(err)
            }
        })
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
            title: "Apakah anda yakin?",
            text: "Pastikan Format yang anda upload sudah benar!",
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
                      url: '/operation/fuel-summary/store',
                      method: 'POST',
                      data: formData,
                      dataType: 'json',
                      processData: false,
                      mimeType: "multipart/form-data",
                      contentType: false,
                      success: function(result){
                          console.log(result)
                          if(result.success){
                              swal("Okey!", result.message, "success");
                              $("body form#ffm-upload-sop").trigger("reset");
                            //   window.location.reload()
                          }else{
                              alert(result.message)
                          }
                      },
                      error: function(err){
                          console.log('error upload >> ', JSON.stringify(err))
                          const { message } = err.responseJSON
                          swal("Opps,,,!", message, "warning")
                      }
                  })
              }else{
                swal("Okey!", 'you cancel upload data...', "success");
              }
        });

    })

    function initDefault(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/fuel-summary/list?limit=',
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