"use client";

import {
  DecodedMessage,
  LightNode,
  createDecoder,
  createEncoder,
  createLightNode,
  waitForRemotePeer,
} from "@waku/sdk";
import { INotificationMessage, PNotificationMessage } from "../formats";

const contentTopic = "/omnisnap/ethindia/v1";

const encoder = createEncoder({ contentTopic });
const decoder = createDecoder(contentTopic);

// TODO: createNode
// TODO: subscribeToIncomingVotes
// TODO: retrieveExistingVotes
// TODO: sendVote


export const createNode = async () => {
  const waku :any= await createLightNode({ defaultBootstrap: true });
//   await waku.start();
  await waitForRemotePeer(waku);
  return waku;
};

export const receiveMessages  = async (
  waku: LightNode,
  callback: (pollMessage: INotificationMessage) => void,
) => {
    //this callback to decode the message
  const _callback = (wakuMessage: DecodedMessage): void => {
    if (!wakuMessage.payload) return;
    const pollMessageObj = PNotificationMessage.decode(wakuMessage.payload);
    const pollMessage = pollMessageObj.toJSON() as INotificationMessage;
    console.log("decoded message recd is ", pollMessage)
    callback(pollMessage);
  };

  const unsubscribe = await waku.filter.subscribe([decoder], _callback);
  return unsubscribe;
};

export const sendMessage = async (waku: LightNode, pollMessage: INotificationMessage) => {
  const protoMessage = PNotificationMessage.create({
    id: pollMessage.id,
    message: pollMessage.message,
  });

  // Serialise the message using Protobuf
  const serialisedMessage = PNotificationMessage.encode(protoMessage).finish();

  // Send the message using Light Push
  await waku.lightPush.send(encoder, {
    payload: serialisedMessage,
  });
};

export const retrieveExistingMessages = async (
  waku: LightNode,
  callback: (pollMessage: INotificationMessage) => void,
) => {
  const _callback = (wakuMessage: DecodedMessage): void => {
    if (!wakuMessage.payload) return;
    const pollMessageObj = PNotificationMessage.decode(wakuMessage.payload);
    const pollMessage = pollMessageObj.toJSON() as INotificationMessage;
    callback(pollMessage);
  };

  // Query the Store peer
  await waku.store.queryWithOrderedCallback([decoder], _callback);
};