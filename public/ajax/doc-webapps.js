$(function(){

    initTab()

    $('li.tab').on('click', function(){
        var elm = $(this)
        var id = elm.find('a').attr('href')
        toggleActiveTab(id)
    })

    function initTab(){
        $('div.tab-content div:first-child').toggleClass('active')
        $('ul.tabs-vertical li:first-child').addClass('active')
        $('div.well').slimScroll({
            height: '450px'
        });
    }

    function toggleActiveTab(id){
        var elm = $('body div'+id).length
        if(elm === 0){
            $('div[name="unfound-tab"]').prop('id', id.substring(1))
        }else{
            $('div[name="unfound-tab"]').removeAttr('id')
        }
    }
})