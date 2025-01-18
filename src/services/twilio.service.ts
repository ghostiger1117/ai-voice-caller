import twilio from 'twilio';
import pino from 'pino';

const logger = pino();
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
const client = twilio(accountSid, authToken);

/**
 * Create an outbound call with status callback.
 */
export const createOutboundCall = async (
  to: string,
  audioUrl: string
): Promise<string> => {
  try {
    logger.info({ to }, 'Creating outbound call');
    
    const call = await client.calls.create({
      to,
      from: twilioPhoneNumber,
      twiml: `
        <Response>
          <Say>Hello! How can I assist you today?</Say>
          <Pause length="1"/>
          <Gather 
            input="speech" 
            timeout="5" 
            speechTimeout="auto"
            speechModel="phone_call"
            language="en-US"
            action="${process.env.APP_URL}/media"
          >
          </Gather>
          <Redirect>${process.env.APP_URL}/media</Redirect>
        </Response>
      `,
      statusCallback: `${process.env.APP_URL}/call-status`,
      statusCallbackMethod: 'POST',
    });

    logger.info({ callSid: call.sid }, 'Successfully created outbound call');
    return call.sid;
  } catch (error) {
    logger.error({ error }, 'Error creating outbound call');
    throw error;
  }
}
