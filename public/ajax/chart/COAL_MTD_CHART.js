$(function () {
	G3_MTD_COAL()

	setInterval(() => {
		G3_MTD_COAL()
	}, 60 * 1000)

	$('select#opt-chart3').on('change', function (e) {
		e.preventDefault()
		G3_MTD_COAL()
	})

	var options = {
		series: [],
		chart: {
			type: 'line',
			toolbar: {
				show: false,
			},
			height: 500,
		},
		colors: ['#77B6EA', '#545454', '#AAE321', '#F8013B'],
		dataLabels: {
			enabled: false,
		},
		stroke: {
			curve: 'smooth',
			width: 2,
		},
		grid: {
			borderColor: '#e7e7e7',
			row: {
				colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
				opacity: 0.5,
			},
		},
		markers: {
			size: 5,
			colors: ['#77B6EA', '#545454', '#AAE321', '#F8013B'],
		},
		legend: {
			position: 'top',
			horizontalAlign: 'right',
		},
	}

	var chart_coal = new ApexCharts(document.querySelector('#chart_coal'), options)

	chart_coal.render()

	function G3_MTD_COAL() {
		var bulan = $('select#opt-chart3').val()
		$.ajax({
			async: true,
			url: '/ajax/grafik3?periode=' + bulan,
			method: 'GET',
			success: function (result) {
				console.log('COAL DATA ::', result)

				var current_month = result.monthly_plan.month
				var satuan = result.monthly_plan.satuan
				var estimasi = result.monthly_plan.estimate
				var actual = parseFloat(result.monthly_plan.actual)
				var persen = result.monthly_plan.persen
				$('small#subtitle-monthly-coal').html(current_month)
				$('b#coal_plan').html(estimasi.toLocaleString('ID') + ' ' + satuan)
				$('b#coal_actual').html(actual.toLocaleString('ID') + ' ' + satuan)
				$('b#coal_persen').html(persen + '%')

				console.log('Coal Result', result)

				let dataset = []
				for (const data of result.actual) {
					let series_data = []
					let label = ''
					for (const series of data) {
						series_data.push(series.value)
						label = series.meta
					}
					dataset.push({
						name: label,
						data: series_data,
						// borderWith: 3,
					})
				}
				chart_coal.updateOptions({
					xaxis: {
						categories: result.labels,
					},
				})
				chart_coal.updateSeries(dataset)
			},
			error: function (err) {
				console.log(err)
			},
		})
	}
})
