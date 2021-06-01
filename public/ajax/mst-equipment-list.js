'use strict'
$(function(){
    setDateString()

    $('input#inpKeyword').on('keydown', function(e){
        if(e.keyCode === 13){
            var search = $(this).val()
            $.get('/master/equipment/list?keyword='+search, function(data){
                $('div#list-content').children().remove()
                $('div#list-content').html(data)
                setDateString()
            })
        }
    })

    $('button.bt-edit-data').on('click', function(){
        var id = $(this).data('id')
        $.get('/master/equipment/'+id+'/show', function(data){
            $('div#list-content').hide()
            $('div#form-show').html(data)
            $('div#form-show').show()
        })
    })

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

    
})