import axios from "axios";

// Store conversations by CallSid
const conversations = new Map<string, { role: string; content: string }[]>();

// Initialize a new conversation
export const initializeConversation = (callSid: string) => {
  conversations.set(callSid, [
    { 
      role: 'system', 
      content: 'You are a helpful AI phone assistant. Keep your responses concise and natural for voice conversation. Always maintain context of the ongoing discussion.'
    }
  ]);
};

// Clean up conversation when call ends
export const cleanupConversation = (callSid: string) => {
  conversations.delete(callSid);
};

export const getGPTResponse = async (prompt: string, callSid: string): Promise<string> => {
  // Get or initialize conversation history
  if (!conversations.has(callSid)) {
    initializeConversation(callSid);
  }
  
  const conversationHistory = conversations.get(callSid)!;
  conversationHistory.push({ role: 'user', content: prompt });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 150, // Limit response length for voice
      },
      {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      },
    );

    const aiResponse = response.data.choices[0].message.content;
    conversationHistory.push({ role: 'assistant', content: aiResponse });
    
    // Keep conversation history manageable (last 10 messages)
    if (conversationHistory.length > 11) { // 1 system message + 10 conversation messages
      conversationHistory.splice(1, 2); // Remove oldest user-assistant pair
    }

    return aiResponse;
  } catch (error) {
    console.error('Error getting GPT response:', error);
    throw error;
  }
};
