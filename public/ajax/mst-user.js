'use strict'
$(function(){
    // swal("Here's a message!")
    $('.dropify').dropify();
    initDeafult()
    setDateString()

    $('#create-form').on('click', function(){
        initCreate()
    })
    $('body').on('click', 'button#bt-back', function(){
        initDeafult()
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

    function setDateString() {
        $('.myDateFormat').each(function(){
            var date = $(this).data(date)
            var elm = $(this).data('elm')
            var dateString = moment(date.date).format('DD-MM-YYYY')
            console.log(date.date);
            if(elm != undefined){
                $(this).find(elm).html(dateString)
            }else{
                $(this).html(dateString)
            }
        })
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

    $('#bt-save-option').on('click', function(e){
        e.preventDefault()
        const names = []
        const values = []
        $('.field-add').each(function(){
            names.push($(this).attr("name"))
            values.push($(this).val())
        })
        console.log(_.object(names, values))
        $.ajax({
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            method: 'POST',
            url: "/setting/sys-options",
            data: _.object(names, values),
            dataType: 'json',
            success: function(res){
                console.log(res)
                if(res.success){
                    swal({
                        title: "Okey!",
                        text: "Insert data success, are you finish insert data ?",
                        type: "success",
                        showCancelButton: true,
                        confirmButtonClass: "btn-warning",
                        confirmButtonText: "Yes",
                        closeOnConfirm: false
                    },
                    function(){
                        window.location.reload()
                    });
                }else{
                    swal("Oops", "Insert data failed", "error")
                }
            },
            error: function(err){
                console.log(err.responseJSON)
                swal("Oops", "Insert data failed", "error")
            }
        })
    })
})