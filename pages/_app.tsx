import { AppProps } from 'next/app'
import { WagmiConfig, createConfig, mainnet } from 'wagmi'
import { createPublicClient, http } from 'viem'

import '../styles/index.css'

const network = 5

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return <WagmiConfig config={config}>
    <Component {...pageProps} />
  </WagmiConfig>
}
