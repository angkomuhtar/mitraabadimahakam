class Utils {
  async infinityCheck(num) {
    return typeof num === "number" && num === Infinity;
  }

  async equipmentTypeCheck(type) {
    switch (type) {
      case "hauler truck":
        return "hauler";
      case "general support":
        return "support";
      case "fuel truck":
        return "fuel";
      case "lightning tower":
        return "tower";
      case "tower lamp":
        return "tower";
      case "water truck":
        return "water";
      case "excavator":
        return "exca";
      case "bulldozer":
        return "dozer";
      default:
        return "hauler";
    }
  }
}

module.exports = new Utils();
