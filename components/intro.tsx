import { useAccount } from 'wagmi';

const Intro = ({connect}) => {
  const { address, isConnected } = useAccount();

  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12">
      <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        Blog.
      </h1>
      {!isConnected && 
    <button onClick={connect} className="border-2 border-black rounded-md p-2 hover:bg-black hover:text-white duration-200 transition-colors">Connect</button>  }
    {isConnected && <p>Welcome back {address.slice(0,8)}&hellip;</p>}
    </section>
  )
}

export default Intro
