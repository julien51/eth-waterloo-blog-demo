import { useMemo } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { paywall } from '../pages';
import { InjectedConnector } from 'wagmi/connectors/injected'


const Connect = () => {
  const { address, isConnected } = useAccount();
  const provider = useMemo(() => {
    return paywall.getProvider('http://localhost:3000/'); 
  }, []);

  const { connect } = useConnect({
    connector: new InjectedConnector({
      options: {
        name: "Unlock Paywall Provider",
        getProvider: () => {
          // Return the provider we created earlier
          return provider;
        },
      },
    }),
  });

  return (
    <>
      {!isConnected && <button onClick={() => {
        connect()
      }} className="border-2 border-black rounded-md p-2 hover:bg-black hover:text-white duration-200 transition-colors">Connect</button>  
      }
      {isConnected && <p>Welcome back {address.slice(0,8)}&hellip;</p>}
    </>
  )
}

export default Connect