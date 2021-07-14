'use strict'
$(function(){
    initDeafult()

    function LoadingData(){
        $('body td.rand').each(function(){
            $(this).html('<i class="fa fa-spin fa-spinner"></i>')
        })
    }

    $('#create-form').on('click', function(){
        initCreate()
    })
    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
    })

    function initDeafult(){
        $('div.content-module').each(function(){ $(this).hide() })
        $('div#list-content').show()
        $.ajax({
            async: true,
            url: '/operation/daily-activity/list',
            method: 'GET',
            beforeSend: function(){
                LoadingData()
            },
            success: function(result){
                $('div#content-list').html(result)
            },
            error: function(err){
                console.log(err);
                swal("Opps,,,!", err.responseJSON.message, "warning")
            }
        })
    }

    function initShow(){
        $('div.content-module').each(function(){ $(this).hide() })
        $('div#form-show').show()
    }

    $('button.bt-show-form').on('click', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.get('/setting/sys-options/'+id+'/show', function(data){
            $("div#form-show").html(data)
            initShow()
        })
    })

    $('body').on('click', 'button.bt-cancel', function(e){
        e.preventDefault()
        initDeafult()
    })

    
})