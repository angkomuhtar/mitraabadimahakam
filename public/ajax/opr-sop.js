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

    // $('body').on('submit', 'form#fm-doc', function(e){
    //     e.preventDefault()
    //     var data = new FormData(this)
    //     $.ajax({
    //         async: true,
    //         url: '/operation/sop',
    //         method: 'POST',
    //         data: data,
    //         dataType: 'json',
    //         processData: false,
    //         mimeType: "multipart/form-data",
    //         contentType: false,
    //         success: function(result){
    //             console.log(result)
    //             const { message } = result
    //             if(result.success){
    //                 swal("Okey,,,!", message, "success")
    //                 initDefault()
    //             }else{
    //                 swal("Opps,,,!", message, "warning")
    //             }
    //         },
    //         error: function(err){
    //             console.log(err)
    //             const { message } = err.responseJSON
    //             swal("Opps,,,!", message, "warning")
    //         }
    //     })
    // })

    // $('body').on('submit', 'form#fm-doc-upd', function(e){
    //     e.preventDefault()
    //     var id = $(this).data('id')
    //     var data = new FormData(this)
    //     $.ajax({
    //         async: true,
    //         url: '/operation/sop/'+id+'/update',
    //         method: 'POST',
    //         data: data,
    //         dataType: 'json',
    //         processData: false,
    //         mimeType: "multipart/form-data",
    //         contentType: false,
    //         success: function(result){
    //             console.log(result)
    //             const { message } = result
    //             if(result.success){
    //                 swal("Okey,,,!", message, "success")
    //                 initDefault()
    //             }else{
    //                 swal("Opps,,,!", message, "warning")
    //             }
    //         },
    //         error: function(err){
    //             console.log(err)
    //             const { message } = err.responseJSON
    //             swal("Opps,,,!", message, "warning")
    //         }
    //     })
    // })

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
                console.log(err);
            }
        })
    })

    function initDefault(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/sop/list?limit=',
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
            url: '/operation/sop/create',
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

    function initShow(id){
        $.ajax({
            async: true,
            url: '/operation/sop/'+id+'/show',
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