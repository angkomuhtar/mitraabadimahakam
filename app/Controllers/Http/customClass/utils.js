//
//
//
class Utils {
  //
  //
  async infinityCheck(num) {
    return typeof num === "number" && num === Infinity;
  }
}

module.exports = new Utils();
