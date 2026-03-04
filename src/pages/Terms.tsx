import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Terms of Service — Formula Forum"
        description="Terms of Service for the Formula Forum app and website."
        path="/terms"
      />
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Terms of Service — Formula Forum</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 4, 2026</p>

        <section className="space-y-8 text-foreground">
          <div>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By creating an account or using the Formula Forum app, you agree to these Terms of Service. If you do not agree, do not use the app.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">2. User Conduct</h2>
            <p className="text-muted-foreground mb-2">You agree that you will NOT post, upload, or share any content that is:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li>Offensive, obscene, defamatory, or hateful</li>
              <li>Harassing, threatening, or abusive toward any individual</li>
              <li>Spam, misleading, or fraudulent</li>
              <li>Illegal or in violation of any third-party rights</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Formula Forum has zero tolerance for objectionable content or abusive behavior. Violations will result in immediate content removal and account termination.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">3. Content Moderation</h2>
            <p className="text-muted-foreground">
              We reserve the right to remove any content and suspend or terminate any account at our sole discretion, without notice, for violations of these Terms. Users can report objectionable content using the in-app reporting tool. We commit to acting on valid reports within 24 hours.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4. Account Deletion</h2>
            <p className="text-muted-foreground">
              You may delete your account at any time from the Profile screen in the app. Account deletion permanently removes your data from our systems.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">5. Privacy</h2>
            <p className="text-muted-foreground">
              Your use of the app is governed by our{" "}
              <a href="/privacy" className="text-primary underline underline-offset-4 hover:text-primary/80">
                Privacy Policy
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">6. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms at any time. Continued use of the app constitutes acceptance of the updated Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
            <p className="text-muted-foreground">
              Questions? Email us at{" "}
              <a href="mailto:support@theformulaforum.com" className="text-primary underline underline-offset-4 hover:text-primary/80">
                support@theformulaforum.com
              </a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
