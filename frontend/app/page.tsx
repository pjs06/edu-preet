import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans overflow-x-hidden selection:bg-[var(--secondary)] selection:text-[var(--primary)]">

      {/* Navigation - Glass Effect */}
      {/* Navigation - Glass Effect */}
      <Navbar />

      {/* Hero Section - Clean & Airy */}
      <header className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Subtle Background Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--secondary)] rounded-full blur-[100px] opacity-40 -z-10 translate-x-1/4 -translate-y-1/4 animate-pulse duration-[10000ms]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-40 -z-10 -translate-x-1/4 translate-y-1/4 animate-pulse duration-[12000ms]"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              New: AI-Powered Learning Paths
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-gray-900 tracking-tight">
              Learning made <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-pink-500">personal & fun.</span>
            </h1>

            <p className="text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light delay-100 animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards' }}>
              Give your child a personalized AI tutor that adapts to their unique learning style. No more frustration, just progress.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 delay-200 animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards' }}>
              <Link
                href="/signup"
                className="px-8 py-4 rounded-full bg-[var(--primary)] text-white text-lg font-bold shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 hover:bg-[var(--primary-hover)] transition transform hover:-translate-y-1 duration-300"
              >
                Get Started for Free
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 rounded-full bg-white text-gray-700 border border-gray-200 text-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition duration-300"
              >
                See How It Works
              </Link>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-400 delay-300 animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards' }}>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-100 border-4 border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-400">
                    {i === 4 ? '+' : ''}
                  </div>
                ))}
              </div>
              <p>Trusted by 1,000+ parents</p>
            </div>
          </div>

          <div className="relative mx-auto lg:mx-0 animate-float">
            <div className="relative z-10 bg-white/40 backdrop-blur-xl rounded-[3rem] p-8 border border-white/50 shadow-2xl shadow-orange-100/50">
              <Image
                src="/images/hero.png"
                alt="Happy child learning"
                width={600}
                height={600}
                className="relative z-10 rounded-3xl transform hover:scale-[1.02] transition duration-700 ease-out"
                priority
              />
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-12 -right-12 bg-white p-4 rounded-2xl shadow-xl shadow-gray-100 animate-bounce delay-700 duration-[3000ms]">
              <span className="text-4xl">🚀</span>
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl shadow-gray-100 animate-bounce delay-100 duration-[4000ms]">
              <span className="text-4xl">✨</span>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid - Glassmorphism */}
      <section id="features" className="py-24 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why kids love learning with us</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              We combine the best of education and technology to create a magical learning experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Adaptive Learning",
                desc: "Lessons that adjust in real-time to your child's pace and understanding.",
                icon: "🎯",
                color: "bg-blue-50 text-blue-500"
              },
              {
                title: "Gamified Progress",
                desc: "Earn badges, streaks, and rewards that make learning feel like play.",
                icon: "🏆",
                color: "bg-orange-50 text-orange-500"
              },
              {
                title: "Instant Feedback",
                desc: "Gentle corrections and explanations the moment they get stuck.",
                icon: "💡",
                color: "bg-green-50 text-green-500"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-[var(--background)] border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition duration-500 hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Split Section - Problem/Solution */}
      <section className="py-24 px-6 bg-[var(--background)] overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-32">

          {/* Problem */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 md:order-1 animate-float-delayed">
              <div className="absolute inset-0 bg-red-50 rounded-full blur-3xl opacity-60 transform scale-90"></div>
              <Image
                src="/images/problem.png"
                alt="Struggling student"
                width={500}
                height={500}
                className="relative z-10 drop-shadow-2xl hover:scale-105 transition duration-700"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-500 text-sm font-bold tracking-wide uppercase">The Challenge</div>
              <h2 className="text-4xl font-bold text-gray-900">One size doesn't fit all.</h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Traditional classrooms move at a single pace. If a student misses a concept, they fall behind. If they're ahead, they get bored. This leads to frustration and a loss of confidence.
              </p>
            </div>
          </div>

          {/* Solution */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-500 text-sm font-bold tracking-wide uppercase">The Solution</div>
              <h2 className="text-4xl font-bold text-gray-900">A tutor that never gets tired.</h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Our AI identifies exactly where your child is struggling and explains concepts in ways they understand—using stories, analogies, or visual aids. It's patient, kind, and always available.
              </p>
              <ul className="space-y-4 pt-4">
                {['Personalized Pacing', 'Visual & Auditory Learning', 'Stress-Free Environment'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-green-50 rounded-full blur-3xl opacity-60 transform scale-90"></div>
              <Image
                src="/images/solution.png"
                alt="Happy student"
                width={500}
                height={500}
                className="relative z-10 drop-shadow-2xl hover:scale-105 transition duration-700"
              />
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section - Premium Clean */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[var(--primary)] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-orange-200 group">
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition duration-1000"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-110 transition duration-1000"></div>
            </div>

            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Unlock your child's potential today.
              </h2>
              <p className="text-orange-100 text-lg max-w-2xl mx-auto">
                Join thousands of parents who have transformed their child's learning journey. Start your 7-day free trial now.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  href="/signup"
                  className="px-10 py-5 bg-white text-[var(--primary)] text-lg font-bold rounded-full shadow-lg hover:bg-gray-50 transition transform hover:-translate-y-1 duration-300"
                >
                  Start Free Trial
                </Link>
              </div>
              <p className="text-sm text-orange-200/80">
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <Footer />
    </div>
  );
}
