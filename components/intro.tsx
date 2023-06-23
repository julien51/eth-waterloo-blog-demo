import { CMS_NAME } from '../lib/constants'

const Intro = () => {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12">
      <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        Blog.
      </h1>
    <button className="border-2 border-black rounded-md p-2 hover:bg-black hover:text-white duration-200 transition-colors">Connect</button>  
    </section>
  )
}

export default Intro
