$(function(){
    initDeafult()
    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/monthly-plan/list?keyword=',
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

    function findDaily(id){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/monthly-plan/list-daily?monthlyplans_id='+id,
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

    $('body').on('click', 'button.bt-view-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        findDaily(id)
    })

    $('body').on('click', 'button#create-form', function(e){
        $.ajax({
            async: true,
            url: '/operation/monthly-plan/create',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', 'button.bt-edit-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/operation/monthly-plan/'+id+'/show',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('submit', 'form#fm-monthly-plan', function(e){
        e.preventDefault()
        var data = new FormData(this)
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/monthly-plan',
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

    $('body').on('submit', 'form#fm-monthly-plan-upd', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        swal({
            title: "Apakah anda yakin untuk update data ?",
            text: "Dengan update data monthly, \nsemua data daily pada periode bulan tersebut akan di hapus\ntermasuk capaian actual !",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Ya, Saya yakin!",
            cancelButtonText: "No, cancel plx!",
            closeOnConfirm: false,
            closeOnCancel: false
          },
          function(isConfirm) {
            if (isConfirm) {
                $.ajax({
                    async: true,
                    headers: {'x-csrf-token': $('[name=_csrf]').val()},
                    url: '/operation/monthly-plan/'+id+'/update',
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
            } else {
              swal("Cancelled", "Your imaginary file is safe :)", "error");
            }
          });
    })

})