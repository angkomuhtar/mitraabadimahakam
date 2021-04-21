$(function(){
    // alert('its works....')
    // $('body').on('click', 'button.bt-select-item', function(e){
    //     e.preventDefault()
    //     var data = $(this).data()
    //     var sp = (data.fullname).split(' ')
    //     $('input[name="email"]').val(data.email)
    //     $('input[name="phone"]').val(data.phone)
    //     $('input[name="jenkel"]').val(data.jenkel)
    //     $('input[name="nm_depan"]').val(sp[0])
    //     $('input[name="nm_belakang"]').val(sp[1] + ' ' + sp[2])
    //     $('div#box-details').show()
    //     $('div#panel-footer').show()
    //     $('div#box-list').hide()
    // })

    // $('')
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
})