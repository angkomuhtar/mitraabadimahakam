$(function(){
    initDeafult()

    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
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

    $('body').on('keyup', 'input#inpKeywordSite', function(e){
        var value = $(this).val()
        if(e.keyCode === 13){
            ajaxSearch(value)
        }
    })

    $('body').on('click', 'button#bt-search-keyword', function(){
        var value = $('input#inpKeywordSite').val()
        ajaxSearch(value)
    })

    $('body').on('change', 'select[name="pit_id"]', function(){
        var values = $(this).val()
        if(values){
            getDataEquipmentOnFleet()
        }else{
            $('body').find('select#equip_id').val(null);
            $('body').find('select#equip_id').trigger('change')
        }
    })

    $('body').on('click', 'button#apply-filter', function(){
        var limit = $('body').find('input#limit').val() || 100
        var pit_id = $('body').find('select#pit_id').val()
        var mulai_tanggal = $('body').find('input#mulai_tanggal').val()
        var hingga_tanggal = $('body').find('input#hingga_tanggal').val()
        $.ajax({
            async: true,
            url: '/operation/daily-issue/list',
            method: 'GET',
            data: {
                keyword: 'true',
                limit: limit,
                pit_id: pit_id,
                start_at: mulai_tanggal,
                end_at: hingga_tanggal
            },
            dataType: 'html',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })


    $('body').on('submit', 'form#fm-issue', function(e){
        e.preventDefault()
        $('body').find('button[type="submit"]').attr('disabled', 'disabled')
        const data = new FormData(this)
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/daily-issue',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                if(result.success){
                    $("body").find('tr.advance-table-row').each(function(){
                        $(this).find('select').val(null).trigger('change')
                        $(this).find('input[name="qty"]').val('')
                    })
                    swal("Okey!", result.message, "success");
                    $('body').find('button[type="submit"]').removeAttr('disabled', 'disabled')
                    initCreate()
                }else{
                    alert(result.message)
                }
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
                $('body').find('button[type="submit"]').removeAttr('disabled', 'disabled')
            },
            complete: function() {
                window.location.reload()
            }
        })
    })

    $('body').on('submit', 'form#fm-issue-upd', function(e){
        e.preventDefault()
        $('body').find('button[type="submit"]').attr('disabled', 'disabled')
        var id = $(this).data('id')
        const data = new FormData(this)
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/daily-issue/'+id+'/update',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                if(result.success){
                    $("body").find('tr.advance-table-row').each(function(){
                        $(this).find('select').val(null).trigger('change')
                        $(this).find('input[name="qty"]').val('')
                    })
                    swal("Okey!", result.message, "success");
                    $('body').find('button[type="submit"]').removeAttr('disabled', 'disabled')
                    initDeafult()
                }else{
                    alert(result.message)
                }
            },
            error: function(err){
                console.log(err)
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
                $('body').find('button[type="submit"]').removeAttr('disabled', 'disabled')
            },
            complete: function() {
                window.location.reload()
            }
        })
    })


    $('body').on('click', 'button.bt-edit-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        // console.log('/operation/daily-issue/'+id+'/show');
        $.ajax({
            async: true,
            url: '/operation/daily-issue/'+id+'/show',
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
                  url: '/operation/daily-issue/'+id+'/destroy',
                  method: 'DELETE',
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
                  },
                //   complete: function() {
                //       window.location.reload()
                //   }
              })
          });
    })

    $('body').on('click', 'a.btn-pagging', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var limit = $('body').find('input#limit').val() || 100
        // console.log(limit);
        $.get('/operation/daily-issue/list?page='+page+'&limit='+limit+'&keyword=', function(data){
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    function initDeafult(){
        $('div.content-module').css('display', 'none')
        var limit = $('body').find('input#limit').val() || 100
        // console.log($('body').find('input#limit').val());
        $.ajax({
            async: true,
            url: '/operation/daily-issue/list?limit='+limit+'&keyword=',
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
            url: '/operation/daily-issue/create',
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
        $.ajax({
            async: true,
            url: '/operation/daily-issue/list?keyword='+value,
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

    function getDataEquipmentOnFleet(){
        var selectOptions = $('body').find('select#equip_id')
        var pit_id = $('select[name="pit_id"]').val()
        var start_at = $('input[name="start_at"]').val()
        $.ajax({
            async: true,
            url: '/ajax/fleet-by-equipment',
            method: 'GET',
            data: {
                pit_id: pit_id,
                start_at: start_at
            },
            dataType: 'json',
            success: function(data){
                console.log(data);
                if(data.length > 0){
                    for (const item of data) {
                        selectOptions.find('option[value="'+item.equip_id+'"]').prop("selected","selected");
                        selectOptions.trigger('change')
                    }
                }else{
                    selectOptions.find('option').val(null);
                    selectOptions.find('option').removeAttr("selected");
                    selectOptions.trigger('change')
                }
            },
            error: function(err){
                console.log(err);
            }
        })
    }
})