$(function(){
    // alert('its works....')
    $('button.bt-select-item').on('click', function(e){
        e.preventDefault()
        var data = $(this).data()
        var sp = (data.fullname).split(' ')
        console.log(sp);
        $('input[name="email"]').val(data.email)
        $('input[name="phone"]').val(data.phone)
        $('input[name="jenkel"]').val(data.jenkel)
        $('input[name="nm_depan"]').val(sp[0])
        $('input[name="nm_belakang"]').val(sp[1] + ' ' + sp[2])
        $('div#box-details').show()
        $('div#panel-footer').show()
        $('div#box-list').hide()
    })
})