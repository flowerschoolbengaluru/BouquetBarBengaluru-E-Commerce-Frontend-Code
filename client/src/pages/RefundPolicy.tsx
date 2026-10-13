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

const strong = "font-semibold text-gray-800";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/">
          <button className="mb-8 inline-flex items-center gap-2 rounded text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </Link>

        <header className="border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            No Refund Policy
          </h1>
        </header>

        <div className="space-y-8 py-10">
          <Clause number={1} title="General Policy">
            <p>
              At Flower School Bengaluru &amp; Bouquet Bar, every floral
              arrangement is carefully handcrafted using fresh, perishable
              blooms. Due to the nature of our products,{" "}
              <strong className={strong}>all sales are final</strong>, and we
              maintain a{" "}
              <strong className={strong}>strict no refund policy</strong> once
              an order has been placed.
            </p>
          </Clause>

          <Clause number={2} title="Perishable Nature of Flowers">
            <p>
              Flowers are natural and perishable products, and their lifespan
              depends on various factors such as temperature, handling, and
              care. As such, we cannot offer refunds or returns once the order
              has been delivered.
            </p>
          </Clause>

          <Clause number={3} title="Order Accuracy and Quality">
            <p>
              We strive to ensure that every order matches the description and
              quality expected. However, minor variations in colour, shape, or
              size may occur due to seasonal and regional availability — these
              are not considered defects and do not qualify for a refund or
              replacement.
            </p>
          </Clause>

          <Clause number={4} title="Incorrect or Incomplete Delivery Information">
            <p>
              Flower School Bengaluru &amp; Bouquet Bar is not responsible for
              delays, failed deliveries, or incorrect items due to inaccurate
              or incomplete delivery details provided by the customer. In such
              cases, refunds will not be issued.
            </p>
          </Clause>

          <Clause number={5} title="Customer Responsibility">
            <p>
              It is the customer's responsibility to provide correct delivery
              details and ensure recipient availability. Once an order is
              confirmed and prepared, it cannot be cancelled, refunded, or
              modified.
            </p>
          </Clause>

          <Clause number={6} title="Exceptional Cases">
            <p>
              While refunds are not provided, we value our customers and are
              committed to resolving genuine concerns. If there is a clear
              issue with the quality or delivery of your order, please contact
              us within <strong className={strong}>24 hours</strong> of
              delivery, along with supporting photos.
            </p>
            <p>
              At our discretion, a{" "}
              <strong className={strong}>replacement</strong> or{" "}
              <strong className={strong}>store credit</strong> may be offered
              as a goodwill gesture — this does not constitute a change to our
              no refund policy.
            </p>
          </Clause>

          <Clause number={7} title="Contact Information">
            <p>
              For any delivery or product concerns, please contact our customer
              service team at:
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