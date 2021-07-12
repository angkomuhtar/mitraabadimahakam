$(function(){
    const data = {
        labels: [
            'Rain',
            'Wait Blasting',
            'Change Shift',
            'P5M',
            'Refueling',
            'No Operator',
            'Pray',
            'Fasting',
            'No Job',
            'No Location'
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [11, 16, 7, 3, 14],
            borderWidth: 0.5,
            backgroundColor: [
            'rgb(255, 99, 132, 0.5)',
            'rgb(75, 192, 192, 0.5)',
            'rgb(255, 205, 86, 0.5)',
            'rgb(201, 203, 207, 0.5)',
            'rgb(161, 208, 245, 0.5)'
            ]
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
                    color: "rgba(204, 255, 51, 0.5)"
                },
                pointLabels: {
                    fontColor: "ff6666"
                },
                gridLines : {
                    color : "#3c4452"
                },
                ticks: {
                    min: 0,
                    max: 15
                }
            }
        }
    }

    new Chart($('#chart5'), config);
})