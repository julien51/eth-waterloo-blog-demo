import Container from '../components/container'
import MoreStories from '../components/more-stories'
import HeroPost from '../components/hero-post'
import Intro from '../components/intro'
import Layout from '../components/layout'
import { getAllPosts } from '../lib/api'
import Head from 'next/head'
import { CMS_NAME } from '../lib/constants'
import Post from '../interfaces/post'
import { useMemo } from 'react'
import { Paywall } from '@unlock-protocol/paywall'
import { networks } from '@unlock-protocol/networks'
import { useAccount, useConnect } from 'wagmi'
import { InjectedConnector } from "wagmi/connectors/injected";


type Props = {
  allPosts: Post[]
}

export const paywall = new Paywall(networks);

export default function Index({ allPosts }: Props) {
  const heroPost = allPosts[0]
  const morePosts = allPosts.slice(1)
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
      <Layout>
        <Head>
          <title>{`Next.js Blog Example with ${CMS_NAME}`}</title>
        </Head>
        <Container>
          <Intro connect={connect} />
          {heroPost && (
            <HeroPost
              title={heroPost.title}
              coverImage={heroPost.coverImage}
              date={heroPost.date}
              author={heroPost.author}
              slug={heroPost.slug}
              excerpt={heroPost.excerpt}
            />
          )}
          {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        </Container>
      </Layout>
    </>
  )
}

export const getStaticProps = async () => {
  const allPosts = getAllPosts([
    'title',
    'date',
    'slug',
    'author',
    'coverImage',
    'excerpt',
  ])

  return {
    props: { allPosts },
  }
}
