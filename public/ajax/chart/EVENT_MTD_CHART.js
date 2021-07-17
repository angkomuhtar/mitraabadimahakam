$(function(){
    G5_MTD_EVENT()

    $('select#opt-chart5').on('change', function(e){
        e.preventDefault()
        G5_MTD_EVENT()
    })

    setInterval(() => {
        G5_MTD_EVENT()
    }, 60 * 1000)

    function G5_MTD_EVENT(){
        var bulan = $('select#opt-chart5').val()
        $.ajax({
            async: true,
            url: '/ajax/grafik5?periode='+bulan,
            method: 'GET',
            success: function(result){
                console.log(result);
                var r = () => Math.random() * 256 >> 0;
                var bgColor = result.data.map(() => `rgb(${r()}, ${r()}, ${r()}, 0.5)`)
                var name = _.pluck(result.data, 'labels')
                var values = _.pluck(result.data, 'nilai')
                const data = {
                    labels: name,
                    datasets: [{
                        label: 'My First Dataset',
                        data: values,
                        borderWidth: 0.5,
                        backgroundColor: bgColor
                    }]
                }
            
                const config = {
                    type: 'polarArea',
                    data: data,
                    options: {
                        legend: {
                            display: true,
                            position: 'bottom'
                        },
                        animation: {
                            animateScale: true
                        },
                        scale:{
                            lineArc: true,
                            angleLines: {
                                // color: "rgba(204, 255, 51, 0.5)"
                                color: "red"
                            },
                            pointLabels: {
                                fontColor: "ff6666"
                            },
                            gridLines : {
                                color : "#3c4452"
                            },
                            ticks: {
                                min: 0,
                                max: parseInt(result.len)
                            }
                        }
                    }
                }
            
                new Chart($('#chart5'), config);
                
            },
            error: function(err){
                console.log(err);
            }
        })

    }
    
})