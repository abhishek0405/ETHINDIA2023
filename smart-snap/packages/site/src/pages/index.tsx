import { useContext } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import Web3 from 'web3'
import subscriptionContractABI from "../../../../../contracts/SubscriptionContractABI.json"
// import { useSDK } from '@metamask/sdk-react';
import type { LightNode } from "@waku/sdk";
import React, { useState,useEffect } from 'react';
import { createNode,retrieveExistingMessages,receiveMessages } from "../lib/waku";
import { INotificationMessage } from '../formats'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Row, Col } from 'react-bootstrap';



import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
  SubscribeButton,
  Poll
} from '../components';
import { defaultSnapOrigin } from '../config';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap,
  isLocalSnap,
  processPrompt,
  subscribe,
  shouldDisplayReconnectButton,
} from '../utils';
import { useSDK } from '@metamask/sdk-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary?.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background?.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  color: ${({ theme }) => theme.colors.text?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error?.muted};
  border: 1px solid ${({ theme }) => theme.colors.error?.default};
  color: ${({ theme }) => theme.colors.error?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [wakuNode, setWakuNode] = useState<LightNode | null>(null);
  const [account, setAccount] = useState<string>();
  const { sdk, connected, connecting, provider, chainId } = useSDK();

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  useEffect(() => {
    if (wakuNode) return;

    (async () => {
      console.log("starting node");
      const node = await createNode();
      console.log("node started");
      setWakuNode(node);
    })();
     
  }, [wakuNode]);
  const goerli_provider = new ethers.JsonRpcProvider("https://eth-goerli.public.blastapi.io");
  // const { sdk, connected, connecting, provider, chainId } = useSDK();

  const connect = async () => {
    console.log("attempting to connect")

    try {

      const accounts :any= await sdk?.connect();
      console.log("accounts are ",accounts)
      setAccount(accounts?.[0]);

      // await connectSnap();
      // const installedSnap = await getSnap();



      // dispatch({
      //   type: MetamaskActions.SetInstalled,
      //   payload: installedSnap,
      // });
    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }

  };
  // const provider =  new ethers.BrowserProvider(window.ethereum)
  const contractAddress = "0x38E1039eD368EDDd73fBBB64ecaAC4447440026b";


  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? state.isFlask
    : state.snapsDetected;

    const handleConnectClick = async () => {
      try {
        await connectSnap();
        const installedSnap = await getSnap();
  
        dispatch({
          type: MetamaskActions.SetInstalled,
          payload: installedSnap,
        });
      } catch (error) {
        console.error(error);
        dispatch({ type: MetamaskActions.SetError, payload: error });
      }
    };

  const handleButtonClick = async () => {
    try {
      const accounts: any = await sdk?.connect();
      setAccount(accounts?.[0]);
    } catch(err) {
      console.warn(`failed to connect..`, err);
    }
  };

  const resolveENSAddress = async (rec_address: any) => {
    console.log(rec_address)
    const address = await goerli_provider.resolveName(rec_address)
    return address
  }

  const sendFundsToAddress = async(res:any) =>{
      const rec_address = res.receiver_address;
      console.log("rec address is ",rec_address)
      const {amount} = res;
      var address = await resolveENSAddress(rec_address)
      const accounts: any = await window.ethereum.request({ method: 'eth_requestAccounts' });
      window.ethereum
      .request({
        method: 'eth_sendTransaction',
        // The following sends an EIP-1559 transaction. Legacy transactions are also supported.
        params: [
          {
            from: accounts[0], // The user's active address.
            to: address, // Required except during contract publications.
            value: Number(amount*1000000000000000000).toString(16), // Only required to send ether to the recipient from the initiating external account.
            gasLimit: '0x5028', // Customizable by the user during MetaMask confirmation.
            maxPriorityFeePerGas: '0x3b9aca00', // Customizable by the user during MetaMask confirmation.
            maxFeePerGas: '0x2540be400', // Customizable by the user during MetaMask confirmation.
          },
        ],
      })
      .then((txHash) => console.log(txHash))
      .catch((error) => console.error(error));
  }

  const setupRecurringPayments = async(res:any)=>{
    const web3Instance = new Web3(window.ethereum);
            const chainId = await web3Instance.eth.getChainId();
            console.log("chainid is ",chainId)
            //base chain
            if(chainId.toString()==="84531"){
              const rec_address = res.receiver_address;
              const {amount} = res;
              const {frequency} = res;
              const {end_time} = res;
              var address = await resolveENSAddress(rec_address)
              console.log("rec address is ",address)
              // const provider = new ethers.JsonRpcProvider("");
              const provider =  new ethers.BrowserProvider(window.ethereum)
              const signer = await provider.getSigner();
              const contract :any= new ethers.Contract(contractAddress, subscriptionContractABI, signer )
              const tx = await contract.subscribe(address, amount,frequency,end_time);
            }else{
              console.log("switch to base goerli")
            }
          
  }
  

  const handleProcessPrompt = async () => {
    try {
      const res : any= await processPrompt();
      //logic to see type of outpu
      console.log(res)
      if(res){
        if(res.function_name ==='send_funds_to_address'){
        await sendFundsToAddress(res);
        }
        else if(res.function_name ==='setup_recurring_payments'){
          await setupRecurringPayments(res);
          }

      }

    } catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  const handleSubscribe = async (amount:any) => {
    try {
      const res : any= await subscribe("abhishek0405.eth",amount,30,180);
      await setupRecurringPayments(res);
    }

   catch (error) {
      console.error(error);
      dispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  return (
    <Container>
      {/* <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading> */}
      <CardContainer>
        {/* {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )} */}
        {!isMetaMaskReady && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (

                <>
                   <button style={{ padding: 10, margin: 10 }} onClick={connect}>
        Connect
      </button>
      {connected && (
        <div>
          <>
            {chainId && `Connected chain: ${chainId}`}
            <p></p>
            {account && `Connected account: ${account}`}
          </>
        </div>
      )} 
                </>


                // <ConnectButton
                //   onClick={handleButtonClick}
                //   disabled={!isMetaMaskReady}
                // />
              ),
            }}
            disabled={!isMetaMaskReady}
          />
        )}
        {/* {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleButtonClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )} */}
        <Card
          content={{
            title: 'Open Snap',
            description:
              'How can I help you?',
            button: (
              <SendHelloButton
                onClick={handleProcessPrompt}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />
                <Card
          content={{
            title: 'Subscribe',
            description:
              'Click to view subscription plans',
            button: (
              // <SubscribeButton
              //   onClick={handleSubscribe}
              //   disabled={!state.installedSnap}
              // />

              <>
                <Button variant="primary" onClick={handleShow}>
                  Launch demo modal
                </Button>

                <Modal show={show} onHide={handleClose}  centered>
        <Modal.Body>
          <Row>
            <Col>
              <h2>Premium Plan</h2>
              <p>Price: 10 TIM/month</p>
              <Button onClick={(e) => handleSubscribe(10)}>Choose</Button>
            </Col>
            <Col>
              <h2>Basic Plan</h2>
              <p>Price: 5 TIM/month</p>
              <Button onClick={(e) => handleSubscribe(5)}>Choose</Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
              
              </>
              
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />

      {/* <button style={{ padding: 10, margin: 10 }} onClick={connect}>
        Connect sdk
      </button> */}
      {/* {connected && (
        <div>
          <>
            {chainId && `Connected chain: ${chainId}`}
            <p></p>
            {account && `Connected account: ${account}`}
          </>
        </div>
      )} */}

      </CardContainer>
      {/* {wakuNode ? <Poll waku={wakuNode} /> : <div>Loading..</div>} */}
    </Container>
  );
};

export default Index;
