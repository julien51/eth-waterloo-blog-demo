# An example of token gated application with an Unlock Membership

This application is an example of how you can very easily monetize a web application with an Unlock based membership!

For this, we are starting with the [blog-starter](https://github.com/vercel/next.js/tree/canary/examples/blog-starter) Next.JS application.
From there, here are the steps to reproduce this in your own web application!

## 1. Installing dependencies

We add dependencies from Unlock: the contracts' ABI, the paywall module and the networks module. These are all optional but let us build applications faster. You should eventually replace them in your production application!

We also use `ethers`, `wagmi` and `viem` which are popular JS front-end tools to handle wallets and smart contracts.

```bash
yarn add @unlock-protocol/contracts @unlock-protocol/paywall @unlock-protocol/networks ethers@5.7.x wagmi viem
```

## 2. Configuration

We now instantiate a Paywall object, as well as configure the wagmi client and provider.

We update the `_app.tsx` file the following:

```javascript
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
```

### 3. Adding a "connect your wallet" button

We add a new `Connect.tsx` component.

```javascript
import { useMemo } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected'

const Connect = () => {
  const { address, isConnected } = useAccount();
  
  // Retrieve the wallet provider from the paywall library
  const provider = useMemo(() => {
    return paywall.getProvider("https://app.unlock-protocol.com"); 
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
```

### 4. Deploying a membership contract!

For this, we use the [Unlock Dashboard](https://app.unlock-protocol.com/), but this could also be done in code directly.

We keep track of the deployed contract address!

### 5. Adding post gating!

We are updating the `[slug].tsx` component to add the token gating logic! 

```js
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import Layout from '../../components/layout'
import { getPostBySlug, getAllPosts } from '../../lib/api'
import PostTitle from '../../components/post-title'
import Head from 'next/head'
import { CMS_NAME } from '../../lib/constants'
import markdownToHtml from '../../lib/markdownToHtml'
import type PostType from '../../interfaces/post'
import { useAccount } from 'wagmi'
import { useContractRead } from 'wagmi'
import { PublicLockV13 } from '@unlock-protocol/contracts'
import Connect from '../../components/Connect'
import { paywall } from '../_app'

const lockAddress = '0x8C1C77B37549De45834739f8cf8b9181D690e2bf'

type Props = {
  post: PostType
  morePosts: PostType[]
  preview?: boolean
}

export default function Post({ post, morePosts, preview }: Props) {
  const router = useRouter()
  const title = `${post.title} | Next.js Blog Example with ${CMS_NAME}`
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }

  const { address, isConnected } = useAccount();

  // Now let's check that the user has a memvership!
  const {data: hasAccess, error, isLoading} = useContractRead({
    address: lockAddress,
    abi: PublicLockV13.abi,
    chainId: 5,
    functionName: 'balanceOf',
    enabled: !!isConnected,
    watch: true,
    args: address ? [address] : [],
    select: (data: number) => {
      return data > 0
    },
  })


  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback || isLoading ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="mb-32">
            <Connect />

              <Head>
                <title>{title}</title>
                <meta property="og:image" content={post.ogImage.url} />
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post.author}
              />
              {hasAccess &&
              <PostBody content={post.content} />}
              {!hasAccess &&
                <div className="max-w-2xl mx-auto">
                  <p>You don't have access!</p>
                  <button onClick={() => {
                    paywall.loadCheckoutModal({
                      locks: {
                        [lockAddress]: {
                          network: 5
                        },
                      },
                      pessimistic: true
                    })
                  }} className="border-2 border-black rounded-md p-2 hover:bg-black hover:text-white duration-200 transition-colors">Purchase membership</button>
                </div>
              }
            </article>
          </>
        )}
      </Container>
    </Layout>
  )
}

type Params = {
  params: {
    slug: string
  }
}

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug, [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
  ])
  const content = await markdownToHtml(post.content || '')

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug'])

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      }
    }),
    fallback: false,
  }
}
```
