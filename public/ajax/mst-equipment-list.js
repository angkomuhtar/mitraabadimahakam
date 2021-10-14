'use strict'
$(function(){
    setDateString()

    $('input#inpKeyword').on('keydown', async function(e){
        var limit = $('input#inpLimit').val()
        if(e.keyCode === 13){
            var search = $(this).val()
            await dataAjax(limit, search)
            // $.get('/master/equipment/list?keyword='+search+'&limit='+limit, function(data){
            //     $('div#list-content').children().remove()
            //     $('div#list-content').html(data)
            //     setDateString()
            // })
        }
    })

    $('button#bt-go').on('click', async function(e){
        var limit = $('input#inpLimit').val()
        var search = $(this).val()
        await dataAjax(limit, search)
    })

    $('button.bt-edit-data').on('click', function(){
        var id = $(this).data('id')
        $.get('/master/equipment/'+id+'/show', function(data){
            $('div#list-content').hide()
            $('div#form-show').html(data)
            $('div#form-show').show()
        })
    })

    async function dataAjax(limit, search){
        $.ajax({
            async: true,
            url: '/master/equipment/list?keyword='+search+'&limit='+limit,
            method: 'GET',
            success: function(data){
                console.log(data);
                $('div#list-content').children().remove()
                $('div#list-content').html(data)
                setDateString()
            },
            error: function(err){
                console.log(err);
            }
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