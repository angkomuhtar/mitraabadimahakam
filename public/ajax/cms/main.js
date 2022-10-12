$(function(){
    $('input[name="company_name"]').on('focus', function(){
        $('div#selector-field').attr('class', '')
        $('div#selector-field').toggleClass('company-name')
    })

    $('textarea[name="company_title"]').on('focus', function(){
        $('div#selector-field').attr('class', '')
        $('div#selector-field').toggleClass('company-hashtag')
    })

    $('input[name="company_phone1"]').on('focus', function(){
        $('div#selector-field').attr('class', '')
        $('div#selector-field').toggleClass('company-phone')
    })

    $('input[name="company_email"]').on('focus', function(){
        $('div#selector-field').attr('class', '')
        $('div#selector-field').toggleClass('company-email')
    })

    $('form[name="main-data"]').on('submit', function(e){
        e.preventDefault()
        var id = $(this).data('id')
        var data = new FormData(this)
        $.ajax({
            async: true,
            url: '/cms/main-cms/'+id+'/update',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
               console.log(result);
               swal("Okey,,,!", result.message, "success")
            },
            error: function(err){
                console.log(err);
            }
        })
    })
})