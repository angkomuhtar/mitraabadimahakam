'use strict'
$(function(){
    // swal("Here's a message!")

    $('a.main-menu').on('click', function(e){
        e.preventDefault()
        var target = $(this).data('id')
        $('tr.submenu-item').hide()
        $('table#tbl-submenu > tbody').find('tr.submenu'+target).show()
    })
})