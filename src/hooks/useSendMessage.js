import { generateMeshPacketId } from '@/utils/packetUtils';

  export const useSendMessage = async (text, channel, contact) => {
    if (!text || !channel || !contact) return;

    const data = {
      messageId: generateMeshPacketId(),
      channelNum: channel.channel_num ?? channel.id,
      fromNodeNum: contact?.nodeNum ?? null, // fallback or session-derived
      toNodeNum: contact?.toNodeNum ?? null,
      message: text,
    };

    if (data.fromNodeNum == null) {
      console.warn('[useSendMessage] fromNodeNum is invalid', data);
    }

    try {
      const res = await fetch(`http://localhost:8080/api/v1/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Server error: ${res.status} - ${error}`);
      }

      console.log('Message sent successfully');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };
