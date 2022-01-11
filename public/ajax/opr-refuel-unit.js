$(function(){

    initDeafult()

    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
    })

    $('body').on('click', '#bt-download', function(e){
        e.preventDefault();
        var host = document.location.host
        window.location.href = 'http://' + host + '/template-xls/refuel-unit-template.xlsx';
    })

    $('body').on('click', 'button#bt-cancel-create', function(e){
        e.preventDefault()
        window.location.reload()
    })

    $('body').on('click', 'button#create-form', function(){
        initCreate()
    })

    $('body').on('click', 'button#bt-cancel-update', function(e){
        e.preventDefault()
        initDeafult()
    })

    $('body').on('keyup', 'input#inpKeywordFuelDist', function(e){
        var value = $(this).val()
        if(e.keyCode === 13){
            ajaxSearch(value)
        }
    })

    $('body').on('click', 'button#bt-search-keyword', function(){
        var value = $('input#inpKeywordFuelDist').val()
        ajaxSearch(value)
    })

    $('body').on('keyup', 'input[name="fm_awal"]', function(){
        var elm = $(this)
        var awal = elm.val()
        var akhir = elm.parents('tr').find('input[name="fm_akhir"]').val()
        elm.parents('tr').find('input[name="subtotal"]').val(parseFloat(akhir) - parseFloat(awal))
    })

    $('body').on('keyup', 'input[name="fm_akhir"]', function(){
        var elm = $(this)
        var akhir = elm.val()
        var awal = elm.parents('tr').find('input[name="fm_awal"]').val()
        elm.parents('tr').find('input[name="subtotal"]').val(parseFloat(akhir) - parseFloat(awal))
    })

    $('body').on('click', 'button#reset-filter', function(e){
        e.preventDefault()
        $(this).parents('div#filtermodal').find('input.form-control, select.form-control').val('')
        $(this).parents('div#filtermodal').find('select.select2x').val(null).trigger('change')
        initDeafult()
    })

    $('body').on('click', 'button#apply-filter', function(e){
        e.preventDefault()
        var limit = $('body').find('input[name="limit"]').val() || 100
        if($('input[name="mulai_tanggal"]').val() != '' && $('input[name="hingga_tanggal"]').val() != ''){
            var data = {
                keyword: true,
                limit: limit,
                begin: $('input[name="mulai_tanggal"]').val(),
                end: $('input[name="hingga_tanggal"]').val(),
                shift_id: $('select[name="shift_id"]').val(),
                fuel_truck: $('select[name="fuel_truck"]').val(),
                equip_id: $('select[name="equip_id"]').val()
            }
            $.ajax({
                async: true,
                url: '/operation/daily-refuel-unit/list',
                method: 'GET',
                data: data,
                dataType: 'html',
                beforeSend: function(){

                },
                success: function(result){
                    console.log('result');
                    $('div#list-content').children().remove()
                    $('div#list-content').html(result).show()
                },
                error: function(err){
                    console.log(err)
                },
                complete: function(){

                }
            })

        }else{
            alert('Tanggal filter blum ditentukan...')
        }
    })

    $('body').on('change', 'input[name="refuel_xls"]', function(){
        var data = new FormData()
        data.append('refuel_xls', $(this)[0].files[0])
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/daily-refuel-unit/upload-file',
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
                $('body').find('select[name="sheet"]').html(result.title.map(s => '<option value="'+s+'"> Sheet [ '+s+' ]</option>'))
                $('body').find('select[name="sheet"]').prepend('<option value="" selected> Pilih </option>')
                $('body').find('textarea[name="dataJson"]').val(JSON.stringify(result.data, null, 2))
                swal("Okey!", "Data berhasil di parsing....", "success")
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })
    

    $('body').on('submit', 'form#fm-refuel-unit', function(e){
        e.preventDefault()
        var data = new FormData(this)
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/daily-refuel-unit',
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
                console.log(result)
                const { message } = result
                if(result.success){
                    swal("Okey,,,!", message, "success")
                    initDeafult()
                }else{
                    swal("Opps,,,!", message, "warning")
                }
            },
            error: function(err){
                console.log('XXXX', err.response)
                swal("Opps,,,!", err.responseJSON.error.message, "error")
            }
        })
    })

    $('body').on('submit', 'form#fm-refuel-unit-upd', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/daily-refuel-unit/'+id+'/update',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                const { message } = result
                if(result.success){
                    swal("Okey,,,!", message, "success")
                    initDeafult()
                }else{
                    swal("Opps,,,!", message, "warning")
                }
            },
            error: function(err){
                console.log(err)
                // const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })


    $('body').on('click', 'button.bt-edit-data', function(e){
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/operation/daily-refuel-unit/'+id+'/show',
            method: 'GET',
            success: function(result){
                $('div#form-show').html(result)
                initShow()
            },
            error: function(err){
                console.log(err);
                swal("Opps,,,!", err.responseJSON.message, "warning")
            }
        })
    })

    $('body').on('click', 'button#bt-delete-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        swal({
            title: "Are you sure?",
            text: "Your will not be able to recover this data file!",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
          },
          function(){
              $.ajax({
                  async: true,
                  headers: {'x-csrf-token': $('[name=_csrf]').val()},
                  url: '/operation/daily-fleet/'+id+'/delete',
                  method: 'POST',
                  dataType: 'json',
                  processData: false,
                  mimeType: "multipart/form-data",
                  contentType: false,
                  success: function(result){
                      console.log(result)
                      const { message } = result
                      if(result.success){
                          swal("Okey,,,!", message, "success")
                          initDeafult()
                      }else{
                          swal("Opps,,,!", message, "warning")
                      }
                  },
                  error: function(err){
                      console.log(err)
                      const { message } = err.responseJSON
                      swal("Opps,,,!", message, "warning")
                  }
              })
            // swal("Deleted!", "Your imaginary file has been deleted.", "success");
          });
    })

    $('body').on('click', 'a.btn-pagging', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        $.get('/operation/daily-refuel-unit/list?page='+page+'&keyword=', function(data){
            console.log(data);
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    function initDeafult(limit){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-refuel-unit/list?keyword=',
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

    function initCreate(){
        $.ajax({
            async: true,
            url: '/operation/daily-refuel-unit/create',
            method: 'GET',
            success: function(htm){
                $('div.content-module').css('display', 'none')
                $('div#form-create').show().html(htm)
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initShow(){
        $('div.content-module').css('display', 'none')
        $('div#form-show').show()
    }

    function ajaxSearch(value){
        console.log('keyword :::', value);
        $.ajax({
            async: true,
            url: '/operation/fuel-dist/list?keyword='+value,
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