$(function(){

    G1_MTD_OB()

    setInterval(() => {
        G1_MTD_OB()
    }, 5 * 1000);

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
                var current_month = result.monthly_plan.month
                var satuan = result.monthly_plan.satuan
                var estimasi = result.monthly_plan.estimate
                var actual = result.monthly_plan.actual
                var persen = (parseFloat(actual) / parseFloat(estimasi)) * 100
                $('small#subtitle-monthly-ob').html(current_month)
                $('b#ob_plan').html((estimasi).toLocaleString('ID') +' '+satuan)
                $('b#ob_actual').html((actual).toLocaleString('ID') +' '+satuan)
                $('b#ob_persen').html((persen).toFixed(2)+'%')
                console.log('result.actual', result.actual);
                new Chartist.Line('#sparkline8', {
                    labels: result.labels,
                    series: [result.actual]
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