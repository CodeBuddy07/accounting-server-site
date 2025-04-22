/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

export const sendSMS = async (to: string, message: string): Promise<void> => {
  try {
    console.log('SMS sending initiated')

    const apiUrl = process.env.SMS_API_URL as string
    const apiKey = process.env.SMS_API_KEY as string
    const senderId = process.env.SMS_SENDER_ID as string

    const response = await axios.post(apiUrl, null, {
      params: {
        api_key: apiKey,
        senderid: senderId,
        number: to,
        message,
        type: 'text', // Text Message
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Explicit header
      },
      timeout: 10000, // Timeout in milliseconds (5 seconds)
      proxy: false, // Disable proxy
    })

    if (response.data.response_code == 202) {
      console.log('SMS sent successfully:', response.data)
    } else {
      console.error('Failed to send SMS:', response.data)
      throw new Error('SMS sending failed')
    }
  } catch (error) {
    console.error('SMS API Error:', error)
    throw error
  }
}

// Bulk SMS Sending API
export const sendBulkSMS = async (
  messages: { to: string; message: any }[],
): Promise<void> => {
  try {
    // Send SMS to all filtered customers
    console.log('Bulk SMS sending initiated');

    const manySMSApiUrl = process.env.MANY_SMS_API_URL as string
    const apiKey = process.env.SMS_API_KEY as string
    const senderId = process.env.SMS_SENDER_ID as string

    const response = await axios.post(
      manySMSApiUrl,
      {
        api_key: apiKey,
        senderid: senderId,
        messages: messages,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Explicit header
        },
        timeout: 10000, // Timeout in milliseconds (5 seconds)
        proxy: false, // Disable proxy
      },
    )

    if (response.data.response_code == 202) {
      console.log('Bulk SMS sent successfully:', response.data)
    } else {
      console.error('Failed to send Bulk SMS:', response.data)
      throw new Error('Bulk SMS sending failed')
    }
  } catch (error) {
    console.error('Bulk SMS Error:', error)
    throw error
  }
}
