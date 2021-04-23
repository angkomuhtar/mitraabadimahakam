$(function(){
    initDeafult()

    $('button#bt-search-keyword').on('click', function(){
        getDataSearch()
    })

    $('body').on('keyup', 'input#inpKeywordModule', function(e){
        if(e.keyCode === 13){
            getDataSearch()
        }
    })

    function initDeafult(){
        $('div.content-module:not(#list-content)').hide()
        $('div#list-content').show()
        getDataSearch()
    }
    function initCreate(){
        $('div.content-module:not(#form-create)').hide()
        $('div#form-create').show()
    }

    function initShow(){
        $('div.content-module:not(#form-show)').hide()
        $('div#form-show').show()
    }

    function getDataSearch(){
        var value = $('input#inpKeywordModule').val()
        $.get('/setting/usr-akses/list?keyword='+value, function(data){
            $('div#list-content').children().remove()
            $('div#list-content').html(data)
            $('input#inpKeywordModule').val('')
        })

    }
})