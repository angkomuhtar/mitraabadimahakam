const { performance } = require('perf_hooks')
class diagnoticTime {
    async durasi (begin) { 
        var t1 = performance.now()
        console.log("Durasi API " + (t1 - begin) + " milliseconds.")
        return parseFloat((((t1 - begin) % 60000) / 1000).toFixed(2)) + ' second'
    }
}

module.exports = new diagnoticTime()