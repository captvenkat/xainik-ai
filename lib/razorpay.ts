import Razorpay from "razorpay";

// Graceful failure for missing Razorpay configuration
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let rz: Razorpay | null = null;

if (!keyId || !keySecret || keyId === "rzp_test_xxxxx" || keySecret === "xxxxx") {
  console.log("Payments disabled: Razorpay keys not configured");
} else {
  rz = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

export { rz };
