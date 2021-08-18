$(function(){
    
    $('body select.select2').each(function(){
        var group = $(this).data('title')
        var selected = $(this).data('check')
        var id = $(this).attr('id')
        var elm = $(this)
        // console.log('SET DATA OPTION FROM INDEX PUBLIC')
        if(group != undefined){
            $.get('/ajax/sys-options?group='+group+'&selected='+selected, function(data){
                elm.children().remove()
                const list = data.map(nod => '<option value="'+nod.nilai+'" '+nod.selected+'>'+nod.teks+'</option>')
                elm.html(list)
            })
        }
    })

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
        $.get('/master/user/search?keyword='+value, function(data){
            $('body div#list-content').html(data)
        })
    }

    $('body').on('click', 'a.btn-pagging', function(e){
        e.preventDefault()
        var page = $(this).data('page')
        var url = window.location.pathname+'/search?keyword=&page='+page
        $.get(url, function(data){
            console.log(data);
            $('body #list-content').children().remove()
            $('body #list-content').append(data)
        })
    })
})