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

    $('body').on('submit', 'form#form-update', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        data.append('file', $('input[type=file]')[0].files[0])
        $.ajax({
            async: true,
            url: '/cms/carousel-img/'+id+'/update',
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

    function initDefault(){
        $.ajax({
            async: true,
            url: '/cms/carousel-img/list',
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

    function initShow(id){
        $.ajax({
            async: true,
            url: '/cms/carousel-img/'+id+'/show',
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