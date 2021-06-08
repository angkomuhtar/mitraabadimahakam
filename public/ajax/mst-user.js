'use strict'
$(function(){
    // swal("Here's a message!")
    $('.dropify').dropify();
    initDeafult()
    setDateString()

    $('body').on('click', 'button#create-form', function(){
        initCreate()
    })
    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
    })
    

    $('body').on('click', 'button.bt-select-item', function(e){
        e.preventDefault()
        var data = $(this).data()
        var sp = (data.fullname).split(' ')
        var nmDepan = sp[1]
        var nmBelakang = sp.length < 2 ? '' : nmDepan+' '+sp[2]
        $('input[name="email"]').val(data.email)
        $('input[name="phone"]').val(data.phone)
        $('input[name="jenkel"]').val(data.jenkel)
        $('input[name="nm_depan"]').val(sp[0])
        $('input[name="nm_belakang"]').val(nmBelakang)
        $('input[name="employee_id"]').val(data.id)
        $('div#box-details').show()
        $('div#panel-footer').show()
        $('div#box-list').hide()
    })

    $('body').on('click', 'button.bt-show-form', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        $.get('/master/user/'+id+'/show', function(data){
            $("div#form-show").html(data)
            initShow()
        })
    })

    $('body').on('click', 'button.bt-cancel', function(e){
        e.preventDefault()
        initDeafult()
    })

    $('form#fm-add-user').on('submit', function(e){
        e.preventDefault()
        var data = new FormData(this)
        $.ajax({
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/master/user',
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
        // $('div#box-list').show()
        searchKeyword()
    }
    function initCreate(){
        $('div.content-module:not(#form-create)').hide()
        $('div#form-create').show()
    }

    function initShow(){
        $('div.content-module:not(#form-show)').hide()
        $('div#form-show').show()
    }

    function searchKeyword(value){
        value = value || ''
        $.get('/master/user/search?keyword='+value, function(data){
            $('body div#list-content').html(data)
        })
    }

    function setDateString() {
        $('.myDateFormat').each(function(){
            var date = $(this).data(date)
            var elm = $(this).data('elm')
            var dateString = moment(date.date).format('DD-MM-YYYY')
            if(elm != undefined){
                $(this).find(elm).html(dateString)
            }else{
                $(this).html(dateString)
            }
        })
    }
})