var express = require("express");
var { Web3 } = require("web3");
const Provider = require("@truffle/hdwallet-provider");
const contract_abi = require("../contracts/SubscriptionContractABI.json");
const schedule = require("node-schedule");
const axios = require("axios");

var app = express();
var port = process.env.PORT || 3000;
require("dotenv").config();

var SmartContractAddress = process.env.CONTRACT_ADDRESS;
var SmartContractABI = contract_abi;
var address = process.env.PUBLIC_ADDRESS;
var privatekey = process.env.PRIVATE_KEY;
var rpcurl = process.env.RPC_URL;

const apiKey = process.env.API_KEY;
const apiKeySecret = process.env.API_SECRET;

const Auth = Buffer.from(apiKey + ":" + apiKeySecret).toString("base64");

const chainId = process.env.CHAIN_ID;

var flag = true;

console.log(apiKey);
console.log(apiKeySecret);
console.log(chainId);
console.log(Auth);

function findMedian(arr) {
  arr.sort((a, b) => a - b);

  const length = arr.length;
  const middle = Math.floor(length / 2);

  if (length % 2 === 0) {
    const median = (arr[middle - 1] + arr[middle]) / 2;
    return median;
  } else {
    return arr[middle];
  }
}

const executePayment = async () => {
  await (async () => {
    var gasFeeData;
    var feePercentileData;
    var baseFeeHistory;
    var baseBusyThreshold;

    try {
      var { data } = await axios.get(
        `https://gas.api.infura.io/networks/${chainId}/suggestedGasFees`,
        {
          headers: {
            Authorization: `Basic ${Auth}`,
          },
        }
      );
      gasFeeData = data;
      //console.log("Suggested gas fees:", gasFeeData);

      var { data } = await axios.get(
        `https://gas.api.infura.io/networks/${chainId}/baseFeePercentile`,
        {
          headers: {
            Authorization: `Basic ${Auth}`,
          },
        }
      );
      feePercentileData = data;
      //console.log("Suggested base fee percentile:", feePercentileData);

      var { data } = await axios.get(
        `https://gas.api.infura.io/networks/${chainId}/baseFeeHistory`,
        {
          headers: {
            Authorization: `Basic ${Auth}`,
          },
        }
      );
      baseFeeHistory = data;
      //console.log("Suggested base fee history:", baseFeeHistory);

      var { data } = await axios.get(
        `https://gas.api.infura.io/networks/${chainId}/busyThreshold`,
        {
          headers: {
            Authorization: `Basic ${Auth}`,
          },
        }
      );
      baseBusyThreshold = data;
      //console.log("Suggested base busy threshold:", baseBusyThreshold);

      //calculation starts here
      var currentBaseFee = parseFloat(gasFeeData.estimatedBaseFee);
      var networkCongestion = gasFeeData.networkCongestion;
      var baseFeePercentile = parseFloat(feePercentileData.baseFeePercentile);
      var busyThreshold = parseFloat(baseBusyThreshold.busyThreshold);

      //find median
      var feeHistory = baseFeeHistory.map(Number);
      //console.log(feeHistory)
      var median = findMedian(feeHistory);
      //console.log(median)

      if (networkCongestion > 0.5) {
        flag = false;
      } else {
        if (
          (currentBaseFee >= 0.05 * baseFeePercentile + baseFeePercentile &&
            currentBaseFee <= baseFeePercentile - 0.05 * baseFeePercentile) ||
          currentBaseFee <= busyThreshold ||
          (currentBaseFee >= 0.05 * median + median &&
            currentBaseFee <= median - 0.05 * median)
        ) {
          //console.log('hello i am here')
          flag = true;
        } else {
          flag = false;
        }
      }
    } catch (err) {
      console.log(err);
    }
  })();

  try {
    //for testing purposes
    flag = true;
    console.log(flag);
    if (flag) {
      console.log("executing payment");
      var provider = new Provider(privatekey, rpcurl);
      var web3 = new Web3(provider);
      var myContract = new web3.eth.Contract(
        SmartContractABI,
        SmartContractAddress
      );
      var receipt = await myContract.methods
        .executeAllPayments()
        .send({ from: address });
      //console.log("receipt", receipt);

      console.log("done with all things");
      console.log("Cron job executed at:", new Date().toLocaleString());
    } else {
      console.log("gas fee too high or network is busy, can't execute");
    }
  } catch (err) {
    console.log("errpr is ", err);
  }
};

schedule.scheduleJob("*/30 * * * * *", async () => await executePayment());
