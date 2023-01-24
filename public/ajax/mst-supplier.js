$(function(){
    initDeafult()

    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
    })

    $('body').on('click', 'button#create-form', function(){
        initCreate()
    })

    $('body').on('click', 'button#bt-cancel-update', function(e){
        e.preventDefault()
        initDeafult()
    })

    $('body').on('keyup', 'input#inpKeywordSupplier', function(e){
        var value = $(this).val()
        if(e.keyCode === 13){
            ajaxSearch(value)
        }
    })

    $('body').on('click', 'button#bt-search-keyword', function(){
        var value = $('input#inpKeywordSupplier').val()
        ajaxSearch(value)
    })

    $('body').on('click', 'button.bt-edit-data', function(e){
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/master/supplier/'+id+'/show',
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#form-content').html(result).show()
            },
            error: function(err){
                console.log(JSON.stringify(err, null, 5));
                swal("Opps,,,!", err.responseJSON, "warning")
            }
        })
    })

    $('body').on('submit', 'form#fm-supplier', function(e){
        e.preventDefault()
        var data = new FormData(this)
        $.ajax({
            async: true,
            url: '/master/supplier',
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
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })

    $('body').on('submit', 'form#fm-supplier-upd', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        $.ajax({
            async: true,
            url: '/master/supplier/'+id+'/update',
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
                const { message } = err.responseJSON
                swal("Opps,,,!", message, "warning")
            }
        })
    })

    $('body').on('click', 'button#bt-delete-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/master/supplier/'+id+'/delete',
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
    })

    $('body').on('click', 'a.btn-pagging', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        $.get('/master/supplier/list?page='+page+'&keyword=', function(data){
            console.log(data);
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
        })
    })

    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/master/supplier/list?keyword=',
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
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/master/supplier/create',
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
        $.ajax({
            async: true,
            url: '/master/supplier/list?keyword='+value,
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