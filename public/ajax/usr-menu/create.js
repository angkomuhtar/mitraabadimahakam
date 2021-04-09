$(function(){
    $('a.target-user').on('click', function(e){
        e.preventDefault()
        var target = $(this).data('name')
        $('h2#target-user').html(target + "<span><small style='font-weight: 100;'> diberikan akses menu :</small></span>")
        // $('tr.submenu-item').hide()
        // $('table#tbl-submenu > tbody').find('tr.submenu'+target).show()
        // alert('ok')
    })
})