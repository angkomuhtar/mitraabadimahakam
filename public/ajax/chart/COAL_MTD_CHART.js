$(function(){

    G3_MTD_COAL()

    setInterval(() => {
        G1_MTD_OB()
    }, 5 * 1000);

    $('select#opt-chart3').on('change', function(e){
        e.preventDefault()
        G3_MTD_COAL()
    })

    function G3_MTD_COAL(){
        var bulan = $('select#opt-chart3').val()
        $.ajax({
            async: true,
            url: '/ajax/grafik3?periode='+bulan,
            method: 'GET',
            success: function(result){
                var current_month = result.monthly_plan.month
                var satuan = result.monthly_plan.satuan
                var estimasi = result.monthly_plan.estimate
                var actual = result.monthly_plan.actual
                var persen = (parseFloat(actual) / parseFloat(estimasi)) * 100
                $('small#subtitle-monthly-coal').html(current_month)
                $('b#coal_plan').html((estimasi).toLocaleString('ID') +' '+satuan)
                $('b#coal_actual').html((actual).toLocaleString('ID') +' '+satuan)
                $('b#coal_persen').html((persen).toFixed(2)+'%')
                new Chartist.Line('#sparkline9', {
                    labels: result.labels,
                    series: [
                        result.actual
                    ]
                    }, {
                    plugins: [
                        Chartist.plugins.ctPointLabels({
                            textAnchor: 'right',
                            labelInterpolationFnc: function(value) {
                                if(value){
                                    return (value/1000) + 'K'
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