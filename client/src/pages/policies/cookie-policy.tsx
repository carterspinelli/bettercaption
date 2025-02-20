import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Cookie Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold">What Are Cookies?</h2>
              <p>
                Cookies are small text files stored on your device when you visit our website. They help us provide and improve our services by remembering your preferences and usage patterns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">How We Use Cookies</h2>
              <h3 className="text-xl font-medium mt-4">1. Essential Cookies</h3>
              <p>Required for basic site functionality:</p>
              <ul className="list-disc pl-6">
                <li>Authentication and security</li>
                <li>Session management</li>
                <li>User preferences</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">2. Functional Cookies</h3>
              <p>Enhance your experience:</p>
              <ul className="list-disc pl-6">
                <li>Theme preferences</li>
                <li>Language settings</li>
                <li>Enhancement preferences</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">3. Analytics Cookies</h3>
              <p>Help us improve our services:</p>
              <ul className="list-disc pl-6">
                <li>Usage patterns</li>
                <li>Feature popularity</li>
                <li>Performance metrics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Cookie Management</h2>
              <p>You can manage cookies through:</p>
              <ul className="list-disc pl-6">
                <li>Browser settings</li>
                <li>Our preference center</li>
                <li>Third-party tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Types of Cookies We Use</h2>
              <table className="min-w-full mt-4">
                <thead>
                  <tr>
                    <th className="text-left">Type</th>
                    <th className="text-left">Purpose</th>
                    <th className="text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Session</td>
                    <td>User authentication</td>
                    <td>Browser session</td>
                  </tr>
                  <tr>
                    <td>Preference</td>
                    <td>Site customization</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td>Analytics</td>
                    <td>Service improvement</td>
                    <td>2 years</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy to reflect changes in our practices or for legal compliance. We will notify you of any material changes.
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
