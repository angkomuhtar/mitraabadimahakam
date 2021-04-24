$(function(){
    initDeafult()

    $('button#bt-search-keyword').on('click', function(){
        getDataSearch()
    })

    $('body').on('keyup', 'input#inpKeywordModule', function(e){
        if(e.keyCode === 13){
            getDataSearch()
        }
    })

    $('body').on('click', 'button#create-form', function(){
        initCreate()
    })

    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
    })

    $('body select.select2').each(function(){
        var group = $(this).data('title')
        var selected = $(this).data('check')
        var elm = $(this)
        if(group != undefined){
            $.get('/ajax/sys-options?group='+group+'&selected='+selected, function(data){
                elm.children().remove()
                const list = data.map(nod => '<option value="'+nod.nilai+'" '+nod.selected+'>'+nod.teks+'</option>')
                elm.html(list)
                elm.prepend('<option value="" selected>Pilih Tipe User</option>')
            })
        }
    })

    $('select#user_tipe').on('change', function(){
        var value = $(this).val()
        $('input.cb-module-akses').prop( "checked", false )
        if(value != ''){
            $('input.cb-module-akses').each(function(){
                var elm = $(this)
                var idmod = $(this).data('id')
                $.ajax({
                    url: '/ajax/usr-module?usertipe='+value+'&idmodule='+idmod,
                    method: 'GET',
                    dataType: 'json',
                    success: function(data){
                        console.log(data);
                        if(data != undefined){
                            elm.prop( "checked", true )
                        }else{
                            elm.prop( "checked", false )
                        }
                    },
                    error: function(err){
                        console.log(err);
                    }
                })
            })
        }
    })

    $('form#fm-user-content-akses').on('submit', function(e){
        e.preventDefault()
        var data = new FormData(this)
        $.ajax({
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/setting/usr-akses',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(data){
                console.log(data);
                if(data.success){
                    swal("Okey,,,!", data.message, "success")
                    window.location.reload()
                }else{
                    swal("Opps,,,!", data.message, "warning")
                }
            },
            error: function(err){
                console.log(err);
                const { message } = err.responseJSON
                swal("Error 404!", message, "error")
            }
        })
    })


    function initDeafult(){
        $('div.content-module:not(#list-content)').hide()
        $('div#list-content').show()
        getDataSearch()
    }
    function initCreate(){
        $('div.content-module:not(#form-create)').hide()
        $('div#form-create').show()
    }

    function initShow(){
        $('div.content-module:not(#form-show)').hide()
        $('div#form-show').show()
    }

    function getDataSearch(){
        var value = $('input#inpKeywordModule').val()
        $.get('/setting/usr-akses/list?keyword='+value, function(data){
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
            $('input#inpKeywordModule').val('')
        })

    }
})