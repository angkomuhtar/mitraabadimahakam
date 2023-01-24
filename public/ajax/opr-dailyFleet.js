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

    $('#openFilter').on('hidden.bs.modal', function (e) {
        var elm = $(this)
        var limit = $('body').find('input#limit-data').val()
        var begin_date = elm.find('input#begin_date').val()
        var begin_date = elm.find('input#begin_date').val()
        var end_date = elm.find('input#end_date').val()
        var pit_id = elm.find('select#pit_id').val()
        var fleet_id = elm.find('select#fleet_id').val()
        var activity_id = elm.find('select#activity_id').val()
        var shift_id = elm.find('select#shift_id').val()
        var uri = `&limit=${limit || 25}&begin_date=${begin_date || ''}&end_date=${end_date || ''}&pit_id=${pit_id || ''}&fleet_id=${fleet_id || ''}&activity_id=${activity_id || ''}&shift_id=${shift_id || ''}`
        ajaxSearch('/operation/daily-fleet/list?filter=true'+uri)
    })

    $('body').on('click', 'button#close-modal', function(e){
        $('input#begin_date').val()
        $('input#begin_date').val()
        $('input#end_date').val()
        $('select#pit_id').val()
        $('select#fleet_id').val()
        $('select#activity_id').val()
        $('select#shift_id').val()
        $('#openFilter').modal('hide')
        ajaxSearch()
    })

    $('body').on('click', 'button#bt-open-equipment-list', function(e){
        e.preventDefault()
        $('div#tbl-equipment-list').show()
        $('div#tbl-equipment-select').hide()
    })

    $('body').on('click', 'button#bt-close-equipment-list', function(e){
        e.preventDefault()
        $('div#tbl-equipment-list').hide()
        $('div#tbl-equipment-select').show()
    })


    $('body').on('click', 'button.bt-edit-data', function(e){
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/operation/daily-fleet/'+id+'/show',
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
        $.get('/operation/daily-fleet/list?page='+page+'&keyword=', function(data){
            console.log(data);
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    function initDeafult(){
        $('div.content-module').css('display', 'none')
        ajaxSearch()
    }

    function initCreate(){
        $.ajax({
            async: true,
            url: '/operation/daily-fleet/create',
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

    function ajaxSearch(url){
        var uri = url || '/operation/daily-fleet/list'
        $.ajax({
            async: true,
            url: uri,
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