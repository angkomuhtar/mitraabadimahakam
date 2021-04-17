'use strict'
$(function(){
    // swal("Here's a message!")
    $('.dropify').dropify();
    initDeafult()

    $('#create-form').on('click', function(){
        initCreate()
    })
    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
    })

    $('select[name="dealer_id"]').on('change', function(){
        var id = $(this).val()
        if(id != ''){
            $.get('/ajax/dealer/'+id, function(data){
                $('input[name=cp_name]').val(data.cp_name)
                $('input[name=cp_email]').val(data.cp_email)
                $('input[name=cp_phone]').val(data.cp_phone)
                $('textarea[name=dealer_desc]').val(data.dealer_desc)
            })
        }else{
            $('.inpdealer').each(function(){$(this).val('')})
        }
    })

    function initDeafult(){
        $('div.content-module').each(function(){ $(this).hide() })
        $('div#list-content').show()
    }
    function initCreate(){
        $('div.content-module').each(function(){ $(this).hide() })
        $('div#form-create').show()
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

    // Post Data 
    $('form#fm-equipment').on('submit', function(e){
        e.preventDefault()
        var data = new FormData(this)
        
        $.ajax({
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
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

    $('body').on('click', 'a.btn-pagging', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var url = window.location.pathname+'/list?page='+page
        $.get(url, function(data){
            $('div#list-content').children().remove()
            $('div#list-content').append(data)
        })
    })

    // function setDateString() {
    //     $('.myDateFormat').each(function(){
    //         var date = $(this).data(date)
    //         var elm = $(this).data('elm')
    //         var dateString = moment(date.date).format('DD-MM-YYYY')
    //         console.log(date.date);
    //         if(elm != undefined){
    //             $(this).find(elm).html(dateString)
    //         }else{
    //             $(this).html(dateString)
    //         }
    //     })
    // }

    
})