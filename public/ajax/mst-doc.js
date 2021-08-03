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

    $('body').on('click', 'input[name="platform"]', function(e){
        var hide = $(this).data('hidden')
        var values = $(this).val()
        $('body').find('i.iconx').css('display', 'none')
        $('i#'+hide).css('display', 'block')
        $.ajax({
            async: true,
            url: '/ajax/doc/fitur?platform='+values,
            method: 'GET',
            success: function(data){
                let opt = data.map(itm => '<option value="'+itm.id+'" data-desc="'+itm.desc+'">'+itm.fitur+'</option>')
                $('select[name="fitur"]').html(opt)
                $('select[name="fitur"]').prepend('<option value="" selected>Pilih</option>')
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('change', 'select#fitur', function(){
        var values = $(this).val()
        var desc = $(this).find('option[value="'+values+'"]').data('desc')
        $('textarea[name="desc"]').val(desc)
    })

    // $('body').on('keyup', 'input#inpKeyworddoc', function(e){
    //     var value = $(this).val()
    //     if(e.keyCode === 13){
    //         ajaxSearch(value)
    //     }
    // })

    // $('body').on('click', 'button#bt-search-keyword', function(){
    //     var value = $('input#inpKeyworddoc').val()
    //     ajaxSearch(value)
    // })

    // $('body').on('click', 'button.bt-edit-data', function(e){
    //     var id = $(this).data('id')
    //     $.ajax({
    //         async: true,
    //         url: '/master/doc/'+id+'/show',
    //         method: 'GET',
    //         success: function(result){
    //             initShow()
    //             $('div#form-show').html(result)
    //         },
    //         error: function(err){
    //             console.log(err);
    //         }
    //     })
    // })

    $('body').on('submit', 'form#fm-doc', function(e){
        e.preventDefault()
        var data = new FormData(this)
        var markupStr = $('#summernote').code()
        data.append('teks', markupStr)
        $.ajax({
            async: true,
            url: '/master/doc',
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

    $('body').on('submit', 'form#fm-doc-upd', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        $.ajax({
            async: true,
            url: '/master/doc/'+id+'/update',
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
            url: '/master/doc/'+id+'/delete',
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
        var keyword = $('input#inpKeyworddoc').val()
        var url = window.location.pathname+'/list?page='+page+'&keyword='+keyword
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
    })

    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/master/doc/list?keyword=',
            method: 'GET',
            success: function(result){
                $('content-module').css('display', 'none')
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
            url: '/master/doc/create',
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

    function initShow(){
        $('div.content-module').css('display', 'none')
        $('div#form-show').show()
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