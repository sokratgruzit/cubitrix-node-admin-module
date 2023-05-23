const { deposit_requests } = require("@cubitrix/models");

async function accept_deposit_request(req, res) {
  try {
    const { _id, amount } = req.body;

    const result = await deposit_requests.findOne({ _id });
    if (!result) {
      return res.status(404).json({ message: "Deposit request not found" });
    }

    result.status = "accepted";
    await result.save();

    // TODO: add amount to user balance

    return res.status(200).json({ message: "Deposit request accepted" });
  } catch (e) {
    res.status(500).json({ message: "Something get wront, try again" });
  }
}
module.exports = {
  accept_deposit_request,
};
