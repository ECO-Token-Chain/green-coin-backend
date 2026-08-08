const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;


const contractABI = [

  "function mint(address to, uint256 amount) public",
  "function rewardStudent(address student, uint256 amount) public"
];

const greenCoinContract = new ethers.Contract(contractAddress, contractABI, wallet);

async function sendReward(studentAddress, points) {
  try {

    const tokenAmount = points.toString();

    console.log(`[Blockchain] Starting reward of ${points} GC to ${studentAddress}...`);

    const tx = await greenCoinContract.mint(studentAddress, tokenAmount);

    console.log(`[Blockchain] Transaction sent! Hash: ${tx.hash}`);

    const receipt = await tx.wait();

    console.log(`[Blockchain]  Success! Transaction confirmed in block ${receipt.blockNumber}`);
    return true;

  } catch (error) {
    console.error(`[Blockchain]  Error sending reward to ${studentAddress}:`, error.message);
    return false;
  }
}

module.exports = {
  provider,
  wallet,
  greenCoinContract,
  sendReward
};
