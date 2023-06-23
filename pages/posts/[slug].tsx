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
import { paywall } from '..'
import Intro from '../../components/intro'
import Connect from '../../components/Connect'

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
    address: lockAddress, // Replace with the lock address!
    abi: PublicLockV13.abi,
    chainId: 5,
    functionName: 'balanceOf',
    enabled: !!isConnected,
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
                        lockAddress: {
                          network: 5
                        }
                      }
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
