import { AppProps } from 'next/app'
import { WagmiConfig, createConfig, mainnet } from 'wagmi'
import { createPublicClient, http } from 'viem'
import '../styles/index.css'
import { goerli } from 'viem/chains'
import { Paywall } from '@unlock-protocol/paywall'
import { networks } from '@unlock-protocol/networks'

export const paywall = new Paywall(networks);

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: goerli,
    transport: http(),
  }),
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return <WagmiConfig config={config}>
    <Component {...pageProps} />
  </WagmiConfig>
}
