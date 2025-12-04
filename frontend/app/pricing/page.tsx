import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--secondary)] selection:text-[var(--primary)]">
            <Navbar />

            <main className="pt-32 pb-24">
                {/* Hero Section */}
                <section className="px-6 mb-20 text-center">
                    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
                            Simple, transparent <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-pink-500">pricing for everyone.</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Start for free, upgrade when you're ready. No hidden fees.
                        </p>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="px-6 mb-24">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 items-start">

                        {/* Free Tier */}
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition duration-300">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                            <p className="text-gray-500 mb-6">For getting started</p>
                            <div className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-lg font-normal text-gray-400">/mo</span></div>
                            <Link href="/signup" className="block w-full py-3 rounded-xl border border-gray-200 text-center font-bold text-gray-700 hover:bg-gray-50 transition">
                                Get Started
                            </Link>
                            <ul className="mt-8 space-y-4">
                                {['Access to 1 subject', 'Basic progress tracking', 'Limited daily lessons'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                                        <span className="text-green-500">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro Tier - Highlighted */}
                        <div className="bg-gray-900 rounded-[2rem] p-8 border border-gray-800 shadow-2xl relative transform md:-translate-y-4">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--primary)] text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase shadow-lg">
                                Most Popular
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                            <p className="text-gray-400 mb-6">For serious learners</p>
                            <div className="text-4xl font-bold text-white mb-6">$19<span className="text-lg font-normal text-gray-500">/mo</span></div>
                            <Link href="/signup" className="block w-full py-3 rounded-xl bg-[var(--primary)] text-center font-bold text-white hover:bg-[var(--primary-hover)] transition shadow-lg shadow-orange-900/20">
                                Start 7-Day Free Trial
                            </Link>
                            <ul className="mt-8 space-y-4">
                                {['Unlimited access to all subjects', 'Advanced AI tutoring', 'Detailed analytics & reports', 'Priority support', 'Offline access'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                                        <span className="text-[var(--primary)]">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* School Tier */}
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition duration-300">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">School</h3>
                            <p className="text-gray-500 mb-6">For classrooms & schools</p>
                            <div className="text-4xl font-bold text-gray-900 mb-6">Custom</div>
                            <Link href="/contact" className="block w-full py-3 rounded-xl border border-gray-200 text-center font-bold text-gray-700 hover:bg-gray-50 transition">
                                Contact Sales
                            </Link>
                            <ul className="mt-8 space-y-4">
                                {['Bulk student management', 'Teacher dashboard', 'Curriculum alignment', 'SSO Integration'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                                        <span className="text-green-500">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </section>

                {/* FAQ Section */}
                <section className="px-6 py-12 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {[
                            { q: "Can I cancel anytime?", a: "Yes, absolutely. There are no contracts or hidden fees. You can cancel your subscription at any time from your dashboard." },
                            { q: "Do you offer a discount for annual plans?", a: "Yes! You get 2 months free if you choose to pay annually." },
                            { q: "Is the content aligned with school curriculum?", a: "Our content is designed to align with major educational standards, ensuring it supports what your child is learning in school." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                                <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                                <p className="text-gray-500">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
