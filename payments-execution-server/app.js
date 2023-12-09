var express = require('express');
var {Web3} = require('web3');
const Provider = require('@truffle/hdwallet-provider');
const contract_abi = require('../contracts/SubscriptionContractABI.json')
const schedule = require('node-schedule')

var app = express();
var port = process.env.PORT || 3000;
require('dotenv').config()

var SmartContractAddress = "0x38E1039eD368EDDd73fBBB64ecaAC4447440026b";
var SmartContractABI = contract_abi;
var address = "0xB0138E967807ccdA91a7aA9abd1d2183cC3D2260"
var privatekey = process.env.PRIVATE_KEY;
var rpcurl = "https://goerli.base.org";

const executePayment = async () => {
    try{
  console.log("executing payment");
  var provider = new Provider(privatekey, rpcurl);
  var web3 = new Web3(provider);
  var myContract = new web3.eth.Contract(SmartContractABI, SmartContractAddress);
  var receipt = await myContract.methods.executeAllPayments().send({from: address});
  //console.log("receipt", receipt);

  console.log("done with all things")
  console.log('Cron job executed at:', new Date().toLocaleString())
    }
    catch(err){
        console.log("errpr is ",err)
    }

}

schedule.scheduleJob("*/30 * * * * *", async () => await executePayment())
