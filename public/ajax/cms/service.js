$(function(){
    initDefault()

    $('body').on('click', 'button.bt-edit-data', function(){
        var id = $(this).data('id')
        initShow(id)
    })

    $('body').on('click', 'button#bt-back, button.bt-cancel', function(e){
        e.preventDefault()
        initDefault()
    })

    $('body').on('click', 'button#create-form', function(e){
        e.preventDefault()
        initCreate()
    })

    $('body').on('submit', 'form#form-create', function(e){
        e.preventDefault()
        var data = new FormData(this)
        data.append('file', $('input[type=file]')[0].files[0])
        $.ajax({
            async: true,
            url: '/cms/service',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
               console.log(result);
               if(result.success){
                   swal("Okey,,,!", result.message, "success")
                   initDefault()
               }else{
                    swal("Opps,,,!", result.message, "error")
               }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('submit', 'form#form-update', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        data.append('file', $('input[type=file]')[0].files[0])
        $.ajax({
            async: true,
            url: '/cms/service/'+id+'/update',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
               console.log(result);
               if(result.success){
                   swal("Okey,,,!", result.message, "success")
                   initDefault()
               }else{
                    swal("Opps,,,!", result.message, "error")
               }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('click', 'button.bt-delete-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/cms/service/'+id+'/destroy',
            method: 'POST',
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
               console.log(result);
               if(result.success){
                   swal("Okey,,,!", result.message, "success")
                   initDefault()
               }else{
                    swal("Opps,,,!", result.message, "error")
               }
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    function initDefault(){
        $.ajax({
            async: true,
            url: '/cms/service/list',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
                $('div#form-content').hide()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initCreate(){
        $.ajax({
            async: true,
            url: '/cms/service/create',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').hide()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initShow(id){
        $.ajax({
            async: true,
            url: '/cms/service/'+id+'/show',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }
    // $('form[name="main-data"]').on('submit', function(e){
    //     e.preventDefault()
    //     var id = $(this).data('id')
    //     var data = new FormData(this)
    //     $.ajax({
    //         async: true,
    //         url: '/cms/main-cms/'+id+'/update',
    //         method: 'POST',
    //         data: data,
    //         dataType: 'json',
    //         processData: false,
    //         mimeType: "multipart/form-data",
    //         contentType: false,
    //         success: function(result){
    //            console.log(result);
    //            swal("Okey,,,!", result.message, "success")
    //         },
    //         error: function(err){
    //             console.log(err);
    //         }
    //     })
    // })
})