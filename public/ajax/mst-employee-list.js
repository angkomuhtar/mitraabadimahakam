'use strict'
$(function(){
    setDateString()
    $('input#inpKeyword').on('keyup', function(e){
        var value = $(this).val()
        if(e.keyCode === 13){
            searchKeyword(value)
        }
    })

    $('button#bt-keyword-search').on('click', function(){
        var value = $('input#inpKeyword').val()
        searchKeyword(value)
    })

    function searchKeyword(value){
        $.get('/master/employee/search?keyword='+value, function(data){
            $('body div#list-content').html(data)
        })
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
})