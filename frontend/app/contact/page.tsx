import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--secondary)] selection:text-[var(--primary)]">
            <Navbar />

            <main className="pt-32 pb-24">
                {/* Hero Section */}
                <section className="px-6 mb-20 text-center">
                    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
                            We'd love to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-pink-500">hear from you.</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Have questions? We're here to help.
                        </p>
                    </div>
                </section>

                <section className="px-6">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">

                        {/* Contact Info & Calendly */}
                        <div className="space-y-12">
                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl">📧</div>
                                        <div>
                                            <p className="font-bold text-gray-900">Email</p>
                                            <p className="text-gray-500">support@eduplatform.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-xl">📍</div>
                                        <div>
                                            <p className="font-bold text-gray-900">Office</p>
                                            <p className="text-gray-500">123 Learning Lane, Edutech City, CA 94000</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Calendly CTA */}
                            <div className="bg-[var(--primary)] rounded-[2rem] p-8 text-white shadow-xl shadow-orange-200 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition duration-700"></div>
                                <h2 className="text-2xl font-bold mb-4 relative z-10">Schedule a Demo</h2>
                                <p className="text-orange-100 mb-8 relative z-10">
                                    Want to see how it works? Book a 15-minute personalized demo with our team.
                                </p>
                                <Link
                                    href="https://calendly.com/"
                                    target="_blank"
                                    className="inline-block px-8 py-3 bg-white text-[var(--primary)] font-bold rounded-xl hover:bg-gray-50 transition transform hover:-translate-y-1 shadow-lg relative z-10"
                                >
                                    Book a Time &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition" placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition" placeholder="How can we help you?"></textarea>
                                </div>
                                <button type="submit" className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg">
                                    Send Message
                                </button>
                            </form>
                        </div>

                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
