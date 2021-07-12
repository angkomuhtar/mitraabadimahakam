$(function(){
    G4_MTD_FUEL()
    
    $('select#opt-chart4').on('change', function(e){
        e.preventDefault()
        G4_MTD_FUEL()
    })
    

    setInterval(() => {
        G4_MTD_FUEL()
    }, 5 * 1000)

    function G4_MTD_FUEL(){
        var bulan = $('select#opt-chart4').val()
        $.ajax({
            async: true,
            url: '/ajax/grafik4?periode='+bulan,
            method: 'GET',
            success: function(result){
                console.log('result::', result.y.length);
                var total = result.y.reduce(function(x, y){ return x + y }, 0)
                $('b#tot_fuel').html(total + ' Liter')
                $('b#avg_day').html(total / result.y.length + ' Liter / Hari')
                new Chartist.Line('#sparkline11', {
                    labels: result.x,
                    series: [result.y]
                    }, {
                    plugins: [
                        Chartist.plugins.ctPointLabels({
                            textAnchor: 'right',
                            labelInterpolationFnc: function(value) {
                                if(value){
                                    return value + ' Lt'
                                }else{
                                    return 0
                                }
                            }
                        }),
                        Chartist.plugins.tooltip({
                            // class: 'class1',
                            appendToBody: true,
                            anchorToPoint: true
                        })
                    ],
                    low: 0,
                    showArea: true
                });
            },
            error: function(err){
                console.log(err);
            }
        })
    }
})