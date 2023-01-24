$(function(){
    initDefult()

    $('body').on('click', '#bt-back', function(){
        initDefult()
    })

    $('body').on('click', 'button#create-equipment-form', function(){
        initCreate()
    })

    $('body').on('keyup', 'input#inpKeywordSubcontEquipment', function(e){
        var value = $(this).val()
        if(e.keyCode === 13){
            ajaxSearch(value)
        }
    })

    $('body').on('click', 'button#bt-search-keyword', function(){
        var value = $('input#inpKeywordSubcontEquipment').val()
        ajaxSearch(value)
    })

    $('body').on('click', 'button.bt-edit-equipment', function(e){
        var id = $(this).data('id')
        $.ajax({
            async: true,
            url: '/master/subcont/'+id+'/show-equipment',
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
            url: '/master/subcont/list-equipment',
            method: 'GET',
            success: function(result){
                $('div#subcontractor-equipment-list').html(result)
                $('div#subcontractor-equipment-form').children().remove()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    $('body').on('submit', 'form#fm-equipment', function(e){
        e.preventDefault()
        var data = new FormData(this)
        $.ajax({
            async: true,
            url: '/master/subcont/store-equipment',
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

    $('body').on('submit', 'form#fm-equipment-upd', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        $.ajax({
            async: true,
            url: '/master/subcont/'+id+'/update-equipment',
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

    $('body').on('click', 'div#subcontractor-equipment-list ul.pagination a.btn-pagging', function(e){
        e.preventDefault()
        var elm = $(this)
        var page = $(this).data('page')
        var keyword = $('input#inpKeywordSubcontEquipment').val()
        var url = window.location.pathname+'/list-equipment?page='+page+'&keyword='+keyword
        $.ajax({
            async: true,
            url: url,
            method: 'GET',
            success: function(result){
                elm.parents('div#subcontractor-equipment-form').children().remove()
                elm.parents('div#subcontractor-equipment-list').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    

    function initCreate(){
        $.ajax({
            async: true,
            url: '/master/subcont/create-equipment',
            method: 'GET',
            success: function(result){
                $('div#subcontractor-equipment-list').children().remove()
                $('div#subcontractor-equipment-form').html(result)
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initShow(result){
        $('div#subcontractor-equipment-list').children().remove()
        $('div#subcontractor-equipment-form').html(result)
    }

    function ajaxSearch(value){
        var url = window.location.pathname+'/list-equipment?keyword='+value
        $.ajax({
            async: true,
            url: url,
            method: 'GET',
            success: function(result){
                $('div#subcontractor-equipment-list').html(result)
            },
            error: function(err){
                console.log(err);
            }
        })
    }
})