import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

const Privacy = () => {
  const title = "Privacy Policy — The Formula Forum";
  const description = "Privacy Policy for The Formula Forum mobile application operated by Triumph Box and Ryde INC.";

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/privacy" />
      <Navigation />

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy for The Formula Forum</h1>
        <p className="text-muted-foreground mb-12">Last updated: March 2, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground">
          <p>
            Triumph Box and Ryde INC ("we", "our", or "us") operates The Formula Forum mobile application (the "App"). This Privacy Policy explains how we collect, use, and protect your information when you use our App.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="mb-4">We collect the following information when you create an account and use the App:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Account Information:</strong> Name, email address, phone number, company name, job title, and state.</li>
              <li><strong className="text-foreground">Profile Content:</strong> Profile photos, cover photos, bio text, social media links, and booking URLs that you choose to provide.</li>
              <li><strong className="text-foreground">User-Generated Content:</strong> Posts, comments, photos, videos, and messages you create within the App.</li>
              <li><strong className="text-foreground">Connection Data:</strong> Records of connections you make with other users through QR code scanning.</li>
              <li><strong className="text-foreground">Device Information:</strong> Device identifiers for the purpose of delivering push notifications via Firebase Cloud Messaging.</li>
              <li><strong className="text-foreground">Usage Data:</strong> General app interaction data collected through Firebase to help us improve the App experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide and operate the App's features, including your profile, social feed, messaging, agenda, and networking tools.</li>
              <li>Deliver push notifications about announcements, messages, connections, and event updates.</li>
              <li>Display your profile to other event attendees for networking purposes.</li>
              <li>Enable vendors to capture and manage leads from QR code scans at events.</li>
              <li>Maintain the leaderboard and gamification features.</li>
              <li>Improve and troubleshoot the App.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Your profile information (name, company, photo, bio) is visible to other registered users of the App.</li>
              <li>When you scan or are scanned via QR code, your basic contact information is shared with the other party.</li>
              <li>Vendors can export lead data (name, email, company) collected through QR scans.</li>
              <li>We do not sell your personal information to third parties.</li>
              <li>We do not share your information with third-party advertisers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Storage and Security</h2>
            <p>
              Your data is stored securely using Google Firebase services, including Firebase Authentication, Cloud Firestore, and Firebase Storage. We implement appropriate technical measures to protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Push Notifications</h2>
            <p>
              We send push notifications for announcements, messages, and event updates. You can disable push notifications or set quiet hours within the App's notification settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="mb-4">You may:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Update or correct your profile information at any time through the App.</li>
              <li>Request deletion of your account and associated data by contacting us at the email below.</li>
              <li>Disable push notifications through the App settings or your device settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p>
              The App is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of any material changes through the App.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2">
              Email: <a href="mailto:info@f3florida.com" className="text-primary hover:underline">info@f3florida.com</a>
            </p>
          </section>
        </div>
      </main>

      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Privacy;
