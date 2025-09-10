// import useMeshMessages from '@/hooks/useMeshMessages';

export default function ContactsRoute() {
  const meshUrl = 'ws://192.168.2.1/api'; // or injected via props/context
  // const { messages, status, sendMessage } = useMeshMessages({
  //   url: meshUrl,
  //   channelId: 'contacts', // optional—filter by channel if needed
  //   dryRun: false,         // flip to true for onboarding
  // });

  return (
    <div>Contacts tab</div>
    // <section>
    //   <h1>Mesh Contacts</h1>
    //   <p>Connection Status: {status}</p>
    //   <ul>
    //     {messages.map((msg, i) => (
    //       <li key={i}>
    //         <strong>{msg.type}</strong>: {JSON.stringify(msg.payload)}
    //       </li>
    //     ))}
    //   </ul>
    // </section>
  );
}
