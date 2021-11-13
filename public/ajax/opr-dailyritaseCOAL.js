$(function(){
    initDeafult()

    /* Create Data Form */
    $('body').on('click', 'button#create-form', function(e){
        e.preventDefault()
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-coal/create',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-show').children().remove()
                $('div#form-show').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', 'button#bt-cancel-create', function(e){
        e.preventDefault()
        window.location.reload()
    })

    /* Update Data Form */
    $('body').on('click', 'button.bt-edit-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-coal/'+id+'/show',
            method: 'GET',
            success: function(result){
                $('div#form-show').children().remove()
                $('div#form-show').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    /* View Data */
    $('body').on('click', 'button.bt-view-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-coal/'+id+'/view',
            method: 'GET',
            success: function(result){
                $('div#form-show').children().remove()
                $('div#form-show').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('keyup', 'input[name="w_gross"]', function(e){
        var gross = $(this).val()
        var tare = $('input[name="w_tare"]').val()
        $('input[name="w_netto"]').val(parseFloat(gross) - parseFloat(tare))
    })

    $('body').on('keyup', 'input[name="w_tare"]', function(e){
        var tare = $(this).val()
        var gross = $('input[name="w_gross"]').val()
        $('input[name="w_netto"]').val(parseFloat(gross) - parseFloat(tare))
    })

    $('body').on('keyup', 'input#limit-data', function(e){
        var values = $(this).val()
        if(e.keyCode === 13){
            $.ajax({
                async: true,
                url: '/operation/daily-ritase-coal/list?limit='+values,
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

    $('body').on('click', '#bt-limit', function(){
        var values = $('input#limit-data').val()
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-coal/list?limit='+values,
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body div#openFilter').on('hidden.bs.modal', function (e) {
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-coal/list',
            data: {
                isFilter: true,
                limit: $('input#limit-data').val(),
                start_checkout_pit: $('input[name="start_checkout_pit"]').val() || null,
                end_checkout_pit: $('input[name="end_checkout_pit"]').val() || null,
                subkon_id: $('select[name="subkon_id"]').val() || null,
                start_tiket: $('input[name="start_tiket"]').val() || null,
                end_tiket: $('input[name="end_tiket"]').val() || null,
                start_kupon: $('input[name="start_kupon"]').val() || null,
                end_kupon: $('input[name="end_kupon"]').val() || null,
                shift_id: $('select[name="shift_id"]').val() || null,
                keyword: $('input[name="inp_keyword"]').val() || null
            },
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', 'button#bt-check-excel', async function(e){
        e.preventDefault()
        await uploadBar(0)

        $('body div#progressbar-upload').show()
        $('body div#myBar').html('Uploading file...')

        var elm = $('select[name="nm_sheet"]')
        var data = new FormData()
        data.append('uploadfiles', $('input#uploadfiles')[0].files[0])
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/daily-ritase-coal/file-validate',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: async function(result){
                console.log(result)
                await uploadBar(50)
                $('body div#myBar').html('Parsing data...')
                $('textarea[name="jsonData"]').val(JSON.stringify(result.data, null, 3))
                elm.html(result.title.map(item => '<option value="'+item+'">'+item+'</option>'))
                elm.prepend('<option value="" selected>Pilih Nama Sheet</option>')
                $('div.selectSheet').show()
                await uploadBar(95)
                $('body div#myBar').html('Finishing proccess...')
                await uploadBar(100)
                $('body div#progressbar-upload').hide()
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })

    $('body').on('submit', 'form#fm-ritase-coal', function(e){
        e.preventDefault()
        var data = new FormData(this)
        swal({
            title: "Apakah anda yakin?",
            text: "Pastikan format data excel anda sudah sesuai!",
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
                      url: '/operation/daily-ritase-coal/',
                      method: 'POST',
                      data: data,
                      dataType: 'json',
                      processData: false,
                      mimeType: "multipart/form-data",
                      contentType: false,
                      success: function(result){
                          console.log(result)
                          if(result.success){
                              swal("Okey!", result.message, "success");
                            //   $("body form#fm-ritase-coal").trigger("reset");
                            //   window.location.reload()
                          }else{
                            swal('Opps...', result.message, 'error')
                          }
                      },
                      error: function(err){
                          console.log(err)
                          const { message } = err.responseJSON
                          swal("Opps,,,!", message, "warning")
                      }
                  })
              }else{
                swal("Okey!", 'you cancel upload data...', "success");
              }
        });
    })

    $('body').on('submit', 'form#fm-ritase-coal-upd', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/daily-ritase-coal/'+id+'/update',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                if(result.success){
                    swal("Okey,,,!", result.message, "success")
                    window.location.reload()
                }else{
                    alert(result.message)
                }
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })

    $('body').on('click', 'a.btn-pagging', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var limit = $('input#limit-data').val()
        var keyword = $('#inp_keyword').val()
        var url = window.location.pathname+'/list?page='+page+'&keyword='+keyword+'&limit='+limit
        $.ajax({
            async: true,
            url: url,
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
                listNoBerkas()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-coal/list?keyword=',
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

    $('body').on('click', 'button#bt-back', function(){
        window.location.reload()
    })

    $('body').on('click', 'a.find-by', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var itemid = $(this).data('item')
        var group = $(this).data('search')
        findRitasePit(id, group, itemid)
    })

    function uploadBar(i) {
        if (i == 0) {
            var elem = document.getElementById("myBar")
            var width = 1;
            var id = setInterval(frame, 10);
            function frame() {
                if (width >= 100) {
                    clearInterval(id);
                    i = 0;
                } else if(width >= 1 && width <= 50) {
                    width++;
                    elem.style.width = width + "%";
                } else if(width >= 51 && width <= 90) {
                    width++;
                    elem.style.width = width + "%";
                }
                
            }
        }
    }
})