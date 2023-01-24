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
                $('select[name="fitur_id"]').html(opt)
                $('select[name="fitur_id"]').prepend('<option value="" selected>Pilih</option>')
                $('textarea[name="desc"]').val('')
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('change', 'select#fitur_id', function(){
        var values = $(this).val()
        var desc = $(this).find('option[value="'+values+'"]').data('desc')
        $('textarea[name="desc"]').val(desc)
    })

    $('body').on('submit', 'form#fm-doc-details', function(e){
        e.preventDefault()
        var data = new FormData(this)
        var markupStr = $('#summernote').code()
        data.append('teks', markupStr)
        $.ajax({
            async: true,
            url: '/master/doc-details',
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
                    initDefault()
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

    $('body').on('submit', 'form#fm-doc', function(e){
        e.preventDefault()
        var data = new FormData(this)
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
                    initDefault()
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

    $('body').on('submit', 'form#fm-doc-details-upd', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        var teks = $('#summernote').code()
        data.append('teks', teks)
        $.ajax({
            async: true,
            url: '/master/doc-details/'+id+'/update',
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
                    initDefault()
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
                    initDefault()
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

    // $('body').on('click', 'button#bt-delete-data', function(e){
    //     e.preventDefault()
    //     var id = $(this).data('id')
    //     $.ajax({
    //         async: true,
    //         headers: {'x-csrf-token': $('[name=_csrf]').val()},
    //         url: '/master/doc-details/'+id+'/destroy?_method=delete',
    //         method: 'POST',
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
                $('div#list-content-details').html(result).show()
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
            url: '/master/doc-details/list?keyword=',
            method: 'GET',
            success: function(result){
                $('content-module').css('display', 'none')
                $('div#form-content-details').children().remove()
                $('div#list-content-details').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })

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
        // $('div.content-module').css('display', 'none')
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

    function initCreateDetails(){
        // $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/master/doc-details/create',
            method: 'GET',
            success: function(result){
                $('div#list-content-details').children().remove()
                $('div#form-content-details').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }

    function initShow(id){
        // $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/master/doc/'+id+'/show',
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

    function initShowDetails(id){
        // $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/master/doc-details/'+id+'/show',
            method: 'GET',
            success: function(result){
                $('div#list-content-details').children().remove()
                $('div#form-content-details').html(result).show()
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
                $('div#list-content-details').children().remove()
                $('div#list-content-details').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    }
})