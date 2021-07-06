$(function(){
    initDeafult()

    /* Create Data Form */
    $('body').on('click', 'button#create-form', function(e){
        e.preventDefault()
        alert('...')
    })

    /* Update Data Form */
    $('body').on('click', 'button.bt-edit-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-coal/'+id+'/show',
            method: 'GET',
            success: function(result){
                $('div#form-show').children().remove()
                $('div#form-show').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    /* View Data */
    $('body').on('click', 'button.bt-view-data', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $('div.content-module').css('display', 'none')
        $.ajax({
            async: true,
            url: '/operation/daily-ritase-coal/'+id+'/view',
            method: 'GET',
            success: function(result){
                $('div#form-show').children().remove()
                $('div#form-show').html(result).show()
            },
            error: function(err){
                console.log(err);
            }
        })
    })

    $('body').on('keyup', 'input[name="w_gross"]', function(e){
        var gross = $(this).val()
        var tare = $('input[name="w_tare"]').val()
        $('input[name="w_netto"]').val(parseFloat(gross) - parseFloat(tare))
    })

    $('body').on('keyup', 'input[name="w_tare"]', function(e){
        var tare = $(this).val()
        var gross = $('input[name="w_gross"]').val()
        $('input[name="w_netto"]').val(parseFloat(gross) - parseFloat(tare))
    })

    $('body').on('keyup', 'input#keywordCoalRitase', function(e){
        var values = $(this).val()
        if(e.keyCode === 13){
            $.ajax({
                async: true,
                url: '/operation/daily-ritase-coal/list?keyword='+values,
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

    $('body').on('submit', 'form#fm-ritase-coal-upd', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        $.ajax({
            async: true,
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/operation/daily-ritase-coal/'+id+'/update',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result)
                if(result.success){
                    swal("Okey,,,!", result.message, "success")
                    window.location.reload()
                }else{
                    alert(result.message)
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
        var keyword = $('#keywordCoalRitase').val()
        var url = window.location.pathname+'/list?page='+page+'&keyword='+keyword
        $.ajax({
            async: true,
            url: url,
            method: 'GET',
            success: function(result){
                $('div#list-content').children().remove()
                $('div#list-content').html(result).show()
                listNoBerkas()
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
            url: '/operation/daily-ritase-coal/list?keyword=',
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

    $('body').on('click', 'a.find-by', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var itemid = $(this).data('item')
        var group = $(this).data('search')
        findRitasePit(id, group, itemid)
    })
})