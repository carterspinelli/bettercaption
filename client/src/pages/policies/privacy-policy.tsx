import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold">Introduction</h2>
              <p>
                This Privacy Policy explains how Bettercaption ("we", "our", or "us") collects, uses, and protects your information when you use our AI-powered image enhancement and social media sharing platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Information We Collect</h2>
              <h3 className="text-xl font-medium mt-4">1. Account Information</h3>
              <p>When you create an account, we collect:</p>
              <ul className="list-disc pl-6">
                <li>Username</li>
                <li>Password (encrypted)</li>
                <li>Email address</li>
                <li>Account preferences</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">2. Image Data</h3>
              <p>When you use our services, we process:</p>
              <ul className="list-disc pl-6">
                <li>Images you upload</li>
                <li>Enhancement preferences</li>
                <li>Generated captions</li>
                <li>Image metadata</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">3. AI Processing Data</h3>
              <p>Our AI systems process:</p>
              <ul className="list-disc pl-6">
                <li>Image content for enhancement</li>
                <li>Caption generation data</li>
                <li>Performance metrics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
              <ul className="list-disc pl-6">
                <li>To provide and improve our image enhancement services</li>
                <li>To generate relevant captions for your content</li>
                <li>To personalize your experience</li>
                <li>To maintain and improve our AI models</li>
                <li>To communicate with you about our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data. All images and personal information are encrypted during transmission and storage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of certain data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@bettercaption.com
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
