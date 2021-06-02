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

    $('button.bt-show-form').on('click', function(e){
       var id = $(this).data('id')
       $('body div.content-module').css('display', 'none')
       $.get('/master/employee/'+id+'/show', function(data){
           $('body div#form-show').html(data)
           $('body div#form-show').show()
       })
    })

    $('select.select2').each(function(){
        var group = $(this).data('title')
        var selected = $(this).data('check')
        var id = $(this).attr('id')
        var elm = $(this)
        console.log('SET DATA OPTION FROM INDEX PUBLIC')
        if(group != undefined){
            $.get('/ajax/sys-options?group='+group+'&selected='+selected, function(data){
                elm.children().remove()
                const list = data.map(nod => '<option value="'+nod.nilai+'" '+nod.selected+'>'+nod.teks+'</option>')
                elm.html(list)
            })
        }
    })

    function searchKeyword(value){
        $.get('/master/employee/list?keyword='+value, function(data){
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