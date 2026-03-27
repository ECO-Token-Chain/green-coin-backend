const { ethers } = require("ethers");
const Transaction = require("../models/transaction.model.js"); // 🚀 Import the Transaction model
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;


const contractABI = [
  "function mint(address to, uint256 amount) public",
  "function rewardStudent(address student, uint256 amount) public",
  "function balanceOf(address owner) view returns (uint256)",
  "function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)",
  "function transfer(address to, uint256 amount) public returns (bool)"
];

const greenCoinContract = new ethers.Contract(contractAddress, contractABI, wallet);

async function sendReward(studentAddress, points, uid) {
  try {

    const tokenAmount = points.toString();

    console.log(`[Blockchain] Starting reward of ${points} GC to ${studentAddress}...`);

    const tx = await greenCoinContract.mint(studentAddress, tokenAmount);

    console.log(`[Blockchain] Transaction sent! Hash: ${tx.hash}`);

    const receipt = await tx.wait();

    console.log(`[Blockchain]  Success! Transaction confirmed in block ${receipt.blockNumber}`);


    await Transaction.create({
      uid: uid,
      walletAddress: studentAddress,
      amount: points,
      pointsUsed: points,
      txHash: tx.hash,
      status: "success",
      type: "reward"
    });

    return true;

  } catch (error) {
    console.error(`[Blockchain]  Error sending reward to ${studentAddress}:`, error.message);


    await Transaction.create({
      uid: uid,
      walletAddress: studentAddress,
      amount: points,
      pointsUsed: points,
      txHash: "",
      status: "failed",
      type: "reward",
      error: error.message
    });

    return false;
  }
}

async function transferTokens(studentWalletAddress, vendorAddress, amount, uid) {
  try {
    console.log(`[Blockchain] Admin transferring ${amount} GC to Vendor ${vendorAddress} on behalf of student ${studentWalletAddress}...`);
    
    // Convert human readable amount to Wei (18 decimals)
    const amountInWei = ethers.parseUnits(amount.toString(), 18);
    
    // Since we removed frontend MetaMask approval, the Admin wallet acts as the central treasury.
    // The Admin transfers tokens directly to the vendor. The student's database points are deducted.
    const tx = await greenCoinContract.transfer(vendorAddress, amountInWei);
    
    console.log(`[Blockchain] Transaction sent! Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`[Blockchain] Success! Transfer confirmed in block ${receipt.blockNumber}`);

    await Transaction.create({
      uid: uid || "PURCHASE",
      walletAddress: vendorAddress, // tokens went here
      amount: amount,
      pointsUsed: amount,
      txHash: tx.hash,
      status: "success",
      type: "purchase"
    });

    return tx.hash;

  } catch (error) {
    console.error(`[Blockchain] Error transferring tokens to vendor:`, error.message);
    
    await Transaction.create({
      uid: uid || "PURCHASE",
      walletAddress: vendorAddress,
      amount: amount,
      pointsUsed: amount,
      txHash: "",
      status: "failed",
      type: "purchase",
      error: error.message
    });

    throw error;
  }
}

module.exports = {
  provider,
  wallet,
  greenCoinContract,
  sendReward,
  transferTokens
};
