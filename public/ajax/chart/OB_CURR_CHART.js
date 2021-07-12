$(function(){
    G2_CURR_RITASE_OB()

    setInterval(() => {
        G2_CURR_RITASE_OB()
    }, 5 * 1000)

    function G2_CURR_RITASE_OB(){
        $.ajax({
            async: true,
            url: '/ajax/grafik2',
            method: 'GET',
            success: function(result){
                console.log(result);
                var data = {
                labels: result.labels,
                    series: [result.data]
                };

                var options = {
                    seriesBarDistance: 5
                };

                var responsiveOptions = [
                    ['screen and (max-width: 640px)', {
                        seriesBarDistance: 2,
                        axisX: {
                        labelInterpolationFnc: function (value) {
                            return value[0];
                        }
                        }
                    }]
                ];
                new Chartist.Bar('#sparkline10', data, options, responsiveOptions);
                $('b#current-ritase').html(result.date)
                
            },
            error: function(err){
                console.log(err);
            }
        })
    }
})