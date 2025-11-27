import Link from "next/link";
import styles from "../styles/Landing.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>EduPlatform</div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.loginLink}>Login</Link>
          <Link href="/signup" className={styles.signupBtn}>
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Your child learns at their own pace <br />
            <span className="text-blue-600">powered by AI</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Personalized learning paths that adapt to your child's needs. No more falling behind.
          </p>
          <div className={styles.heroButtons}>
            <Link
              href="/signup"
              className={styles.primaryBtn}
            >
              Start Free Trial
            </Link>
            <Link
              href="#how-it-works"
              className={styles.secondaryBtn}
            >
              See How It Works
            </Link>
          </div>
          <p className={styles.socialProof}>
            Join 1,000+ students learning better • Try 7 days free
          </p>
        </div>
      </header>

      {/* Problem Statement */}
      <section className={styles.problemSection}>
        <div className={styles.problemContent}>
          <h2 className={styles.sectionTitle}>
            Does your child struggle to keep up in class?
          </h2>
          <p className={styles.sectionText}>
            Every student learns differently. Traditional classrooms move at one speed, leaving some bored and others behind. We fix this by giving every student their own personal AI tutor that never gets tired and always understands.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.howItWorksSection}>
        <div className={styles.howItWorksContent}>
          <h2 className={`${styles.sectionTitle} text-center mb-16`}>How It Works</h2>
          <div className={styles.stepsGrid}>
            {/* Step 1 */}
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>AI Teaches a Concept</h3>
              <p className={styles.stepText}>
                Interactive lessons with visual aids and real-world examples, tailored to your child's grade and language.
              </p>
            </div>
            {/* Step 2 */}
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Quick Check</h3>
              <p className={styles.stepText}>
                A short quiz every 2 minutes ensures understanding before moving forward. No gaps in learning.
              </p>
            </div>
            {/* Step 3 */}
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Instant Remediation</h3>
              <p className={styles.stepText}>
                If confused, our AI explains it differently instantly. We don't move on until they get it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricingSection}>
        <div className={styles.pricingContent}>
          <h2 className="text-3xl font-bold mb-6">Simple, Affordable Pricing</h2>
          <div className={styles.pricingCard}>
            <div className={styles.pricingBadge}>Premium Access</div>
            <div className={styles.pricingPrice}>₹499<span className={styles.pricingPeriod}>/mo</span></div>
            <p className={styles.pricingNote}>Cancel anytime. No hidden fees.</p>

            <ul className={styles.pricingFeatures}>
              <li className={styles.pricingFeature}><span className={styles.checkIcon}>✓</span> Unlimited AI Learning Sessions</li>
              <li className={styles.pricingFeature}><span className={styles.checkIcon}>✓</span> All Subjects (Math, Science, Languages)</li>
              <li className={styles.pricingFeature}><span className={styles.checkIcon}>✓</span> Detailed Parent Reports</li>
              <li className={styles.pricingFeature}><span className={styles.checkIcon}>✓</span> Priority Support</li>
            </ul>

            <Link
              href="/signup"
              className={styles.pricingBtn}
            >
              Start 7-Day Free Trial
            </Link>
            <p className={styles.pricingSubtext}>No credit card required for trial</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-bold text-blue-900">EduPlatform</div>
            <p className="text-gray-500 text-sm mt-2">© 2024 EduPlatform Inc.</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="#" className={styles.footerLink}>Privacy</Link>
            <Link href="#" className={styles.footerLink}>Terms</Link>
            <Link href="#" className={styles.footerLink}>Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
