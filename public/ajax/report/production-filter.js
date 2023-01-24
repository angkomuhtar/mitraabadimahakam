$(function(){
    var body = $('body')
    console.log('ajax/report/production-filter.js');

    body.find('select[name="range_type"]').on('change', function(){
        var values = $(this).val()
        var site_id = body.find('select[name="site_id"]').val()
        console.log('====================================');
        console.log('......xxx', values);
        console.log('====================================');

        if(values === 'PW'){
            $.ajax({
                async: true,
                url: '/ajax/pit?site_id='+site_id,
                method: 'GET',
                success: function(result){
                    body.find('div#row-bar').css('dispaly', 'inline')
                    result.map((el, i) => {
                        var bar = i + 1
                        body.find('label#txt-label-color'+bar).html('BAR ' + el.kode)
                    })
                },
                error: function(err){
                    console.log(err);
                },
                complete: function(){
                    console.log('finish...');
                }
            })
        }
        if(values === 'MW'){
            body.find('div#row-bar').css('dispaly', 'inline')
            body.find('div#row-line').css('dispaly', 'inline')
        }
    })
})