import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

function Clause({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex gap-4">
      <span className="mt-0.5 w-6 shrink-0 text-right font-semibold text-pink-600">
        {number}.
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="mt-2 space-y-3 leading-relaxed text-gray-600">
          {children}
        </div>
      </div>
    </section>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-pink-400">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <p className="font-medium text-gray-800">{children}</p>;
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/shop">
          <button className="mb-8 inline-flex items-center gap-2 rounded text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </button>
        </Link>

        <header className="border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Privacy Policy
          </h1>
        </header>

        <div className="space-y-8 py-10">
          <Clause number={1} title="Introduction">
            <p>
              Welcome to Our Flower School Bengaluru &amp; Bouquet Bar. We
              value your privacy and are committed to protecting your personal
              information. This Privacy Policy explains how we collect, use,
              and safeguard your information when you visit our website or
              interact with our flower shop and flower school services.
            </p>
            <p>
              By using our website, you agree to the terms of this Privacy
              Policy.
            </p>
          </Clause>

          <Clause number={2} title="Information We Collect">
            <p>We may collect the following types of information:</p>
            <SubHeading>a. Personal Information:</SubHeading>
            <Bullets
              items={[
                "Name",
                "Email address",
                "Phone number",
                "Billing and delivery address",
                "Payment details (processed securely through third-party payment providers)",
              ]}
            />
            <SubHeading>b. Non-Personal Information:</SubHeading>
            <Bullets
              items={[
                "Browser type and version",
                "IP address",
                "Pages visited and time spent on our website",
                "Device information and cookies (for analytics and site performance)",
              ]}
            />
          </Clause>

          <Clause number={3} title="How We Use Your Information">
            <p>We use your information to:</p>
            <Bullets
              items={[
                "Process and deliver flower orders",
                "Enrol you in our flower school courses or workshops",
                "Communicate with you regarding your orders, classes, or inquiries",
                "Send updates, promotions, or newsletters (only with your consent)",
                "Improve our website, products, and services",
                "Comply with legal and regulatory requirements",
              ]}
            />
          </Clause>

          <Clause number={4} title="Sharing Your Information">
            <p>
              We do not sell or rent your personal information. We may share
              limited information only with:
            </p>
            <Bullets
              items={[
                "Delivery partners to complete your flower deliveries",
                "Payment processors for secure transaction handling",
                "Email or SMS service providers for communication purposes",
                "Legal authorities, if required by law",
              ]}
            />
            <p>
              All third-party partners are required to protect your information
              and use it only for the intended purpose.
            </p>
          </Clause>

          <Clause number={5} title="Cookies and Tracking Technologies">
            <p>
              Our website uses cookies to enhance your browsing experience and
              analyse site performance. You can choose to disable cookies
              through your browser settings, but some features of the website
              may not function properly without them.
            </p>
          </Clause>

          <Clause number={6} title="Data Security">
            <p>
              We use appropriate administrative, technical, and physical
              safeguards to protect your personal information from
              unauthorized access, misuse, or disclosure.
            </p>
          </Clause>

          <Clause number={7} title="Your Rights">
            <p>You have the right to:</p>
            <Bullets
              items={[
                "Access, update, or correct your personal information",
                "Request deletion of your data, where applicable",
                "Withdraw consent for marketing communications at any time",
              ]}
            />
            <p>
              To exercise these rights, please contact us at{" "}
              <a
                href="mailto:info@flowerschoolbengaluru.com"
                className="font-medium text-pink-700 hover:underline"
              >
                info@flowerschoolbengaluru.com
              </a>
              .
            </p>
          </Clause>

          <Clause number={8} title="Retention of Information">
            <p>
              We retain your personal information only as long as necessary to
              fulfil the purposes outlined in this policy or as required by
              law.
            </p>
          </Clause>

          <Clause number={9} title="Links to Other Websites">
            <p>
              Our website may contain links to third-party sites. We are not
              responsible for the privacy practices or content of these
              external websites.
            </p>
          </Clause>

          <Clause number={10} title="Updates to This Policy">
            <p>
              We may update this Privacy Policy from time to time. The latest
              version will always be posted on this page with the updated
              date.
            </p>
          </Clause>

          <Clause number={11} title="Contact Us">
            <p>
              If you have any questions or concerns about this Privacy Policy,
              please contact us at:
            </p>
            <p className="font-medium text-gray-800">
              Flower School Bengaluru &amp; Bouquet Bar
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-pink-600" />
                <a href="tel:+919972803847" className="hover:text-gray-900">
                  +91 99728 03847
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-pink-600" />
                <a
                  href="mailto:info@flowerschoolbengaluru.com"
                  className="hover:text-gray-900"
                >
                  info@flowerschoolbengaluru.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-pink-600" />
                <span>
                  #440, 18th Main Rd, 6th block Koramangala, Koramangala,
                  Bengaluru, Karnataka 560095, India
                </span>
              </li>
            </ul>
          </Clause>
        </div>
      </div>
    </div>
  );
}