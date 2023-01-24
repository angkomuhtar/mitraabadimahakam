$(function(){
    initDefult()

    $('body').on('click', '#bt-back', function(){
        initDefult()
    })

    $('body').on('click', 'button#create-employee-form', function(){
        initCreate()
    })

    $('body').on('keyup', 'input#inpKeywordSubcontEmployee', function(e){
        var value = $(this).val()
        if(e.keyCode === 13){
            ajaxSearch(value)
        }
    })

    $('body').on('click', 'button#bt-search-keyword', function(){
        var value = $('input#inpKeywordSubcontEmployee').val()
        ajaxSearch(value)
    })

    $('body').on('click', 'button.bt-edit-employee', function(e){
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/master/subcont/'+id+'/show-employee',
            method: 'GET',
            success: function(result){
                initShow(result)
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    function initDefult(){
        $.ajax({
            async: true,
            url: '/master/subcont/list-employee',
            method: 'GET',
            success: function(result){
                $('div#subcontractor-employee-list').html(result)
                $('div#subcontractor-employee-form').children().remove()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    $('body').on('submit', 'form#fm-employee', function(e){
        e.preventDefault()
        var data = new FormData(this)
        $.ajax({
            async: true,
            url: '/master/subcont/store-employee',
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
                    initDefult()
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

    $('body').on('submit', 'form#fm-employee-upd', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        $.ajax({
            async: true,
            url: '/master/subcont/'+id+'/update-employee',
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
                    initDefult()
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

    $('body').on('click', 'div#subcontractor-employee-list ul.pagination a.btn-pagging', function(e){
        e.preventDefault()
        var elm = $(this)
        var page = $(this).data('page')
        var keyword = $('input#inpKeywordSubcontEmployee').val()
        var url = window.location.pathname+'/list-employee?page='+page+'&keyword='+keyword
        $.ajax({
            async: true,
            url: url,
            method: 'GET',
            success: function(result){
                elm.parents('div#subcontractor-employee-form').children().remove()
                elm.parents('div#subcontractor-employee-list').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    

    function initCreate(){
        $.ajax({
            async: true,
            url: '/master/subcont/create-employee',
            method: 'GET',
            success: function(result){
                $('div#subcontractor-employee-list').children().remove()
                $('div#subcontractor-employee-form').html(result)
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initShow(result){
        $('div#subcontractor-employee-list').children().remove()
        $('div#subcontractor-employee-form').html(result)
    }

    function ajaxSearch(value){
        var url = window.location.pathname+'/list-employee?keyword='+value
        $.ajax({
            async: true,
            url: url,
            method: 'GET',
            success: function(result){
                $('div#subcontractor-employee-list').html(result)
            },
            error: function(err){
                console.log(err);
            }
        })
    }
})