'use strict'
$(function(){
    // swal("Here's a message!")
    initDeafult()

    $('#create-form').on('click', function(){
        initCreate()
    })
    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
    })
    function initDeafult(){
        $('div.content-module').css('display', 'none')
        $('div#list-content').show()
    }
    function initCreate(){
        $('div.content-module').css('display', 'none')
        $.get('/setting/usr-menu/create', function(data){
            $('div#form-create').html(data)
            $('div#form-create').show()
        })
    }

    function initShow(){
        $('div.content-module').css('display', 'none')
        $('div#form-show').show()
    }

    $('body').on('click', 'button.bt-cancel', function(e){
        e.preventDefault()
        initDeafult()
    })

    $('a.main-menu').on('click', function(e){
        e.preventDefault()
        var target = $(this).data('id')
        $('tr.submenu-item').hide()
        $('table#tbl-submenu > tbody').find('tr.submenu'+target).show()
    })

    $('button.bt-show-form').on('click', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.get('/setting/usr-menu/'+id+'/show', function(data){
            $("div#form-show").html(data)
            initShow()
        })
    })
})