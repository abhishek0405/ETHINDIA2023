import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { heading, panel, text,divider } from '@metamask/snaps-sdk';

async function getServerResponse(userPrompt: any) {
  
  const payload = {
    user_prompt: userPrompt,
  };
  const response = await fetch(`http://localhost:8001/processPrompt`, {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
    }),
    body: JSON.stringify(payload),
  });
  return response.json();
}
/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'processPrompt':
      const userPrompt =  await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',
          content: panel([
            heading(`Enter your instruction`),
            text('How can i help you?'),
          ]),
          placeholder: 'Send 0.001 eth to alice.eth'
        },
      });
      console.log(userPrompt)
      if(userPrompt!==null){
        const res = await getServerResponse(userPrompt);
      //   const res = {
      //     "receiver_address":"abhishek0405.eth",
      //     "amount":"0.001"
      // }
        console.log("response from server is "+JSON.stringify(res));
        if(res.function_name==='setup_recurring_payments'){
        const recurringConfirmationPrompt =  await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'confirmation',
            content: panel([
              heading(`Please review the payment setup`),
              divider(),
              text('Receiver :  ' + res.receiver_address),
              divider(),
              text('Amount :  ' + res.amount + "  tokens "),
              divider(),
              text('Pay every :  ' + res.frequency + "  seconds  "),
              divider(),
              text('Pay for :  ' + res.end_time + "   seconds  ")
            ]),
          },
        });
        if(recurringConfirmationPrompt === true){
          return res;
        } else{
          return null;
        }
        }else{
          return res;

        }


      }

    case 'subscribe':


    default:
      throw new Error('Method not found.');
  }
};
