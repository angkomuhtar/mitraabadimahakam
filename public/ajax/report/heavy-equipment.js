$(function(){

    var body = $('body')

    var arrModels = []

    var siteName

    var period

    console.log('ajax/report/production-filter.js');

    initFilter()

    body.find('select.form-control').select2()

    body.on('change', 'select[name="site_id"]', function(){
        var values = $(this).val()
        if(values){
            $.ajax({
                async: true,
                url: '/ajax/site/'+values,
                method: 'GET',
                dataType: 'json',
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                success: function(result){
                    console.log(result);
                    siteName = result.name
                    body.find('td#site_nm').html(result.name)
                    body.find('div[id="unit_model"]').css('display', 'block')
                    GET_MODELS(result.id)
                },
                error: function(err){
                    console.log(err)
                    body.find('div[id="unit_model"]').css('display', 'none')
                    body.find('select[name="unit_model"]').val(null).trigger('change')
                }
            })
        }else{
            body.find('div[id="unit_model"]').css('display', 'none')
            body.find('select[name="unit_model"]').val(null).trigger('change')
        }
    })

    body.on('change', 'select[name="unit_model"]', function(){
        var values = $(this).val()
        body.find('td#unit_model').html('MODEL ' + values)
        const [items] = arrModels.filter(val => val.model === values)
        body.find('span#equipment-group').html(
            items.items.map(elm => '<span class="label label-inverse label-rounded" style="margin-right:5px;margin-bottom:5px">'+elm.kode+'</span>')
        )
        if(values){
            body.find('div#box-select-periode').css('display', 'block')
        }
    })

    body.on('click', 'input[name="inp_ranges"]', function(){
        var values = $(this).val()
        console.log(values);
        period = values
        body.find('div.container-ranges').css('display', 'none')
        body.find('div#box-input-'+values).css('display', 'block')
        body.find('div#box-apply-chart').css('display', 'block')
    })

    

    body.on('submit', 'form#filter-data', function(e){
        e.preventDefault()
        var data = new FormData(this)
        $.ajax({
            async: true,
            url: '/report/heavy-equipment',
            method: 'POST',
            data: data,
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result);
                GEN_CHART(result)
                $.ajax({
                    async: true,
                    url: '/report/heavy-equipment/table',
                    method: 'POST',
                    data: data,
                    dataType: 'html',
                    processData: false,
                    mimeType: "multipart/form-data",
                    contentType: false,
                    success: function(res){
                        body.find('div#box-table-kpi').html(res)
                    }
                })
                result.byDataRatio.length > 0 && 
                body.find('span#byDataRatio-UnScheduled').html(
                    result.byDataRatio?.filter(obj => obj.name==="Scheduled")[0]?.items.length
                )
                result.byDataRatio.length > 0 &&
                body.find('span#byDataRatio-Scheduled').html(result.byDataRatio?.filter(obj => obj.name==="UnScheduled")[0]?.items.length)
                body.find('div#box-chart').css('display', 'block')
                body.find('div#box-table-kpi').slimScroll({
                    height: '375px'
                });
            },
            error: function(err){
                console.log(err)
            }
        })
    })

    body.on('click', 'button#bt-generate-pdf', function(e){
        e.preventDefault()
        var fd = new FormData(document.querySelector('form'))
        var promise1 = domtoimage.toBlob(document.getElementById('container'))
        .then(function (blob) {
            console.log(blob);
            blob.fileName = 'chartKPI.png'
            blob.extname = 'png'
            blob.extname = 'png'
            fd.append('kpi_chart', 'chartKPI.png');
            fd.append('ImgKpi', blob);
            return fd
        });
        var promise2 = domtoimage.toBlob(document.getElementById('box-container-ratio'))
        .then(function (blob) {
            console.log(blob);
            blob.fileName = 'chartRatio.png'
            blob.extname = 'png'
            blob.extname = 'png'
            fd.append('ratio_chart', 'chartRatio.png');
            fd.append('ImgRatio', blob);
            return fd
        });
        var promise3 = domtoimage.toBlob(document.getElementById('container-duration'))
        .then(function (blob) {
            console.log(blob);
            blob.fileName = 'chartDuration.png'
            blob.extname = 'png'
            blob.extname = 'png'
            fd.append('duration_chart', 'chartDuration.png');
            fd.append('ImgDuration', blob);
            return fd
        });
        var promise4 = domtoimage.toBlob(document.getElementById('container-event'))
        .then(function (blob) {
            console.log(blob);
            blob.fileName = 'chartEvent.png'
            blob.extname = 'png'
            blob.extname = 'png'
            fd.append('event_chart', 'chartEvent.png');
            fd.append('ImgEvent', blob);
            return fd
        });
        
        Promise.all([promise1, promise2, promise3, promise4]).then((values) => {
            console.log(values);
            
            $.ajax({
                async: true,
                url: '/report/heavy-equipment/gen-data-pdf',
                method: 'POST',
                data: fd,
                dataType: 'json',
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                success: function(result){
                    console.log(result)
                    pdfMake.createPdf(result).open();
                },
                error: function(err){
                    console.log(err)
                }
            })
            console.log('okey....');
        });
    })

    function GET_MODELS(site_id){
        $.ajax({
            async: true,
            url: '/ajax/equipment/model?site_id='+site_id,
            method: 'GET',
            dataType: 'json',
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            success: function(result){
                console.log(result);
                arrModels = result
                body.find('select[name="unit_model"]').select2()
                body.find('select[name="unit_model"]').html(
                    result.map(val => `<option value="${val.model}">MODEL ${val.model}</option>`)
                )
            },
            error: function(err){
                console.log(err)
            }
        })
    }


    function initFilter(){
        $.ajax({
            async: true,
            url: '/report/heavy-equipment/filter',
            method: 'GET',
            success: function(result){
                body.find('div#list-content').html(result)
            },
            error: function(err){
                console.log(err);
            },
            complete: function(){
                console.log('finish...');
            }
        })
    }

    function GEN_CHART(data){
        
        body.on('change', 'select[name="dimensi"]', function(){
            PERFORMANCES_CHART ()
            DURATION_EVENT()
            COUNT_EVENT()
        })

        body.on('keyup, change', 'input[name="alfa"]', function(){
            PERFORMANCES_CHART ()
            DURATION_EVENT()
            COUNT_EVENT()
        })
    
        body.on('keyup, change', 'input[name="beta"]', function(){
            PERFORMANCES_CHART ()
            DURATION_EVENT()
            COUNT_EVENT()
        })

        body.on('keyup, change', 'input[name="depth"]', function(){
            PERFORMANCES_CHART ()
            DURATION_EVENT()
            COUNT_EVENT()
        })

        PERFORMANCES_CHART ()
        DURATION_EVENT()
        COUNT_EVENT()

        function PERFORMANCES_CHART () {
            var dimensi =  body.find('select[name="dimensi"]').val()
            var alfaNum =  body.find('input[name="alfa"]').val()
            var betaNum =  body.find('input[name="beta"]').val()
            var depthNum =  body.find('input[name="depth"]').val()
            var viewDistanceNum =  body.find('input[name="viewDistance"]').val()
            Highcharts.chart('container', {
                chart: {
                    zoomType: 'xy',
                    type: body.find('select[id="typeChart"]').val(),
                    options3d: {
                        enabled: dimensi != '3d' ? false:true,
                        alpha: parseInt(alfaNum) || 1,
                        beta: parseInt(betaNum) || 370,
                        depth: parseInt(depthNum) || 40,
                        viewDistance: parseInt(viewDistanceNum) || 25
                    }
                },
                title: {
                    text: 'GRAFIK KPI PERFORMANCES'
                },
                subtitle: {
                    text: siteName
                },
                xAxis: {
                    categories: data.byKPI.xAxis,
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Performance'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:.1f} %</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        dataLabels: {
                            enabled: true
                        },
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: data.byKPI.series.map(obj => {
                    return {
                        ...obj,
                        data: obj.data.map(val => parseFloat(val?.toFixed(2) || 0))
                    }
                })
            })
        }

        if(data.byDataRatio.length > 0){
            Highcharts.chart('container-ratio', {
                chart: {
                    type: 'pie',
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0
                    }
                },
                title: {
                    text: 'Breakdown Ratio'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        size: 200,
                        center: ['50%', '20%'],
                        allowPointSelect: true,
                        cursor: 'pointer',
                        depth: 35,
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}'
                        }
                    }
                },
                series: data.byRatio
            });
        }else{
            $('div#container-ratio').html('<h3><strong>Breakdown Ratio</strong></h3><p class="text-danger">Tidak ada data yang dapat ditampilkan...</p>')
        }

        function DURATION_EVENT(){
            if(data.byDuration.xAxis.length > 0){
                Highcharts.chart('container-duration', {
                    chart: {
                        type: 'bar'
                    },
                    title: {
                        text: 'Top 10 Stoppages By Duration'
                    },
                    xAxis: {
                        categories: data.byDuration.xAxis,
                        title: {
                            text: null
                        }
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Total Hours',
                            align: 'high'
                        },
                        labels: {
                            overflow: 'justify'
                        }
                    },
                    tooltip: {
                        valueSuffix: ' Hours'
                    },
                    plotOptions: {
                        bar: {
                            dataLabels: {
                                enabled: true
                            }
                        }
                    },
                    legend: {
                        labelFormatter: function () {
                            return `Total Duration By Periode ${period === 'date'?'dai':period}ly`
                        }
                    },
                    series: data.byDuration.series
                });
            }else{
                $('div#container-duration').html('<h3><strong>Top 10 Stoppages By Duration</strong></h3><p class="text-danger">Tidak ada data yang dapat ditampilkan...</p>')
            }
        }

        function COUNT_EVENT(){
            if(data.byEvents.xAxis.length > 0){
                Highcharts.chart('container-event', {
                    chart: {
                        type: 'bar',
                    },
                    title: {
                        text: 'Top 10 Stoppages By Event'
                    },
                    xAxis: {
                        categories: data.byEvents.xAxis,
                        title: {
                            text: null
                        }
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Event Count',
                            align: 'high'
                        },
                        labels: {
                            overflow: 'justify'
                        }
                    },
                    tooltip: {
                        valueSuffix: ' events'
                    },
                    plotOptions: {
                        bar: {
                            dataLabels: {
                                enabled: true
                            }
                        }
                    },
                    legend: {
                        labelFormatter: function () {
                            return `Total Event By Periode ${period === 'date'?'dai':period}ly`
                        }
                    },
                    series: data.byEvents.series
                });
            }else{
                $('div#container-event').html('<h3><strong>Top 10 Stoppages By Event</strong></h3><p class="text-danger">Tidak ada data yang dapat ditampilkan...</p>')
            }
        }

    }
})