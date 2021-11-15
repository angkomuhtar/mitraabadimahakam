$(function(){

    G1_MTD_OB()

    setInterval(() => {
        G1_MTD_OB()
    }, 45 * 1000);

    $('select#opt-chart1').on('change', function(e){
        e.preventDefault()
        G1_MTD_OB()
    })

    function G1_MTD_OB(){
        var bulan = $('select#opt-chart1').val()
        $.ajax({
            async: true,
            url: '/ajax/grafik1?periode='+bulan,
            method: 'GET',
            success: function(result){
                console.log('RESULT OB ::', result);
                var satuan = 'BCM'
                var estimasi = result.sum_estimasi
                var actual = result.sum_actual
                var persen = (parseFloat(actual) / parseFloat(estimasi)) * 100
                $('b#ob_plan').html((estimasi).toLocaleString('ID') +' '+satuan)
                $('b#ob_actual').html((actual).toLocaleString('ID') +' '+satuan)
                $('b#ob_persen').html((persen).toFixed(2)+'%')
                new Chartist.Line('#sparkline8', {
                    labels: result.labels,
                    series: result.series
                    }, {
                    plugins: [
                        Chartist.plugins.ctPointLabels({
                            textAnchor: 'right',
                            labelInterpolationFnc: function(value) {
                                if(value){
                                    return ((value/1000)).toFixed(2) + 'K'
                                }else{
                                    return 0
                                }
                            }
                        }),
                        Chartist.plugins.legend({
                            legendNames: result.series.map(x => x[0].meta),
                            clickable: true,
                            position: 'bottom',
                            className: 'ob-legend',
                            onClick: function(val){
                                console.log('VAL :::', val);
                            }
                        }),
                        Chartist.plugins.tooltip({
                            class: 'class1',
                            appendToBody: true,
                            anchorToPoint: true
                        })
                    ],
                    low: 0,
                    showArea: true,
                });
               
            },
            error: function(err){
                console.log(err);
            }
        })
    }
})