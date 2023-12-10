import React, { useEffect, useState } from "react";
import { sendMessage, receiveMessages, retrieveExistingMessages } from "../lib/waku"
import { LightNode } from "@waku/sdk";
import { INotificationMessage } from "../formats";
import { ethers } from 'ethers';
import subscriptionContractABI from "../../../../../contracts/SubscriptionContractABI.json"
import { useSDK } from '@metamask/sdk-react';
import {notify} from '../utils/snap'
interface IProps {
  waku: LightNode; // Passing the Waku instance as a prop
}

export const Poll: React.FC<IProps> = ({ waku }) => {
    const { sdk, connected, connecting, provider, chainId } = useSDK();

    const contractAddress = "0x38E1039eD368EDDd73fBBB64ecaAC4447440026b";
    const [account,setAccount] = useState('');

   


  // Process a received vote into the vote counts state
  const processReceivedMessage = (notificationMessage: INotificationMessage) => {
    console.log("message recd is ",notificationMessage)
  };

  const handleSendMessage = ()=>{
    sendMessage(waku,{
        "id":"1",
        "message":"moster lil mor"
    })
  }

  useEffect(()=>{
    const getAccount = async()=>{
      const accounts :any= await sdk?.connect();
      console.log("accounts are ",accounts)
      setAccount(accounts?.[0]);
      // return accounts[0];
    }

    getAccount();

    
  },[])
 
  useEffect(() => {
    const fetchMessages = async () => {
      console.log("Listening for messages");
    //   await retrieveExistingMessages(waku, processReceivedMessage);
      await receiveMessages(waku, processReceivedMessage);

    };
    const readContractEvents = async() =>{
        try{
        // initializing provider and dai contract instance
        // const provider = new ethers.JsonRpcProvider("https://goerli.base.org");
        const provider =  new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(
            contractAddress,
            subscriptionContractABI,
            provider
        );
        // caching the emitted event
        // contract && contract.on("PaymentSent", async(sender,receiver,amount) =>  {
        //     console.log("Some event is emmited ",sender,receiver,amount);
        //     console.log("account set ",account);
        //     console.log("check flag " + account===sender)
        //     if(account.toLowerCase()==sender.toLowerCase()){
        //       console.log("event recd")
        //       notify(sender,receiver,amount)
        //     }
          
        // })

    }
    catch(err){
        console.log("error while reading event is "+err)
    }

    }
    // fetchMessages();
    // readContractEvents();
  }, [waku]);

  return (
   <>
   Loaded
   <button onClick={handleSendMessage}>Send message</button>
   </>
  );
};

// export default Poll;