import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Bettercaption's services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. Service Description</h2>
              <p>
                Bettercaption provides AI-powered image enhancement and caption generation services, including:
              </p>
              <ul className="list-disc pl-6">
                <li>Image enhancement and optimization</li>
                <li>AI-generated caption suggestions</li>
                <li>Social media integration</li>
                <li>Content management tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">3. User Accounts</h2>
              <h3 className="text-xl font-medium mt-4">3.1 Account Creation</h3>
              <p>
                You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.
              </p>

              <h3 className="text-xl font-medium mt-4">3.2 Account Responsibilities</h3>
              <p>You are responsible for:</p>
              <ul className="list-disc pl-6">
                <li>All activities under your account</li>
                <li>Maintaining accurate account information</li>
                <li>Protecting your account credentials</li>
                <li>Reporting unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. Content Guidelines</h2>
              <p>You agree not to upload or generate:</p>
              <ul className="list-disc pl-6">
                <li>Illegal or harmful content</li>
                <li>Content that violates intellectual property rights</li>
                <li>Misleading or fraudulent content</li>
                <li>Content that violates privacy rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. AI Services</h2>
              <p>
                Our AI services are provided "as is." While we strive for accuracy, we don't guarantee specific results from our enhancement or caption generation features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">6. Intellectual Property</h2>
              <p>
                You retain rights to your original content. You grant us a license to process and enhance your images for service delivery.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">7. Termination</h2>
              <p>
                We reserve the right to terminate or suspend accounts that violate these terms or engage in harmful behavior.
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-8">
              Last updated: February 20, 2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
