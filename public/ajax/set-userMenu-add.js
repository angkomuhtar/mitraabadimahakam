$(function(){
    $('a.target-user').on('click', function(e){
        e.preventDefault()
        var target = $(this).data('name')
        var iduser = $(this).data('id')
        $('input[name="user_id"]').val(iduser)
        $('h2#target-user').html(target + "<span><small style='font-weight: 100;'> diberikan akses menu :</small></span>")
    })

    $('input[name="menu"]').on('click', function(){
        var elm = $(this)
        var id = $(this).attr('id')
        if(elm.prop('checked')){
            $('li.'+id).show()
        }else{
            $('li[class^="'+id+'"]').hide()
            $('li[class^="'+id+'"] > div > input').prop('checked', false)
        }
    })

    $('form#fm-user-menu-add').on('submit', function(e){
        e.preventDefault()
        var data = new FormData(this)
        $.ajax({
            headers: {'x-csrf-token': $('[name=_csrf]').val()},
            url: '/setting/usr-menu/create',
            method: 'POST',
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            enctype: 'multipart/form-data',
            dataType: 'json',
            beforeSend: function(){
                $('body').find('div.preloader').show()
            },
            success: function(res){
                console.log(res)
                $('body').find('div.preloader').hide()
                
            },
            error: function(err){
                console.log(err)
                $('body').find('div.preloader').hide()
                const res = err.responseJSON
                swal("Opps", res.message+" !", "error")
            }
        })
    })
})