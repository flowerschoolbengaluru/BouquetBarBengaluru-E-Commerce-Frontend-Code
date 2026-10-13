import { Link } from "wouter";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

type Clause = {
  title: string;
  intro?: string;
  bullets?: string[];
};

const deliveryClauses: Clause[] = [
  {
    title: "Delivery Coverage",
    intro:
      "Flower School Bengaluru & Bouquet Bar currently offers delivery services available across Bangalore. Deliveries outside these areas may be accommodated upon request and may be subject to additional delivery fees.",
  },
  {
    title: "Delivery Schedule",
    intro:
      "Standard delivery hours are from 9:00 AM to 6:00 PM, Monday through Sunday.",
    bullets: [
      "Same-day delivery is available for orders placed before 3:00 PM.",
      "While every effort will be made to deliver within the requested time slot, specific delivery times cannot be guaranteed due to variable traffic, weather, or operational conditions.",
    ],
  },
  {
    title: "Delivery Fees",
    intro:
      "Delivery charges are determined based on the delivery location and type of service (standard, express, or midnight).",
  },
  {
    title: "Recipient Availability",
    intro:
      "It is the customer's responsibility to ensure that the recipient is available to accept the delivery at the provided address. If the recipient is unavailable at the time of delivery:",
    bullets: [
      "The delivery partner may contact the recipient or leave the order with a neighbour, security guard, or reception (if permitted).",
      "If delivery cannot be completed, a re-delivery fee may apply.",
    ],
  },
  {
    title: "Incorrect or Incomplete Address",
    intro:
      "Flower School Bengaluru & Bouquet Bar is not responsible for non-delivery or delays resulting from incorrect, incomplete, or insufficient delivery details provided by the customer. Please verify the address carefully before placing your order.",
  },
  {
    title: "Substitution Policy",
    intro:
      "Due to seasonal and regional availability, certain flowers, wrapping materials, or containers may need to be substituted with similar items of equal or higher value. Such substitutions are made while maintaining the overall design, theme, and value of the arrangement.",
  },
  {
    title: "Delivery Delays",
    intro:
      "In the event of unforeseen circumstances such as extreme weather conditions, traffic disruptions, strikes, or public holidays, deliveries may be delayed. Flower School Bengaluru & Bouquet Bar will make every reasonable effort to notify customers and complete delivery as soon as possible.",
  },
  {
    title: "Order Modification and Cancellation",
    bullets: [
      "Same-Day and Next-Day Deliveries: Cancellations or refunds are not permitted for same-day or next-day deliveries, as order processing begins immediately after confirmation.",
      "Advance Orders (Beyond Next-Day): Cancellations are allowed within 24 hours of placing the order. Any requests made after this period will not be accepted.",
      "Delivery Fees: In the event of a cancellation after dispatch to the delivery partner, delivery charges are non-refundable.",
      "Once an order is prepared, dispatched, or delivered, it cannot be cancelled or refunded.",
    ],
  },
  {
    title: "Non-Delivery Due to Recipient Refusal",
    intro:
      "If the recipient refuses to accept the delivery for any reason, the order will be considered delivered and no refund will be issued.",
  },
  {
    title: "Proof of Delivery",
    intro:
      "Proof of delivery, such as a delivery photo, signature, or confirmation message, may be provided upon request for verification purposes.",
  },
  {
    title: "Third-Party Delivery Policy",
    bullets: [
      "Once an order is handed over to a Delivery Partner, the responsibility for the safe and timely delivery of the product lies with them.",
      "We ensure all products leave our premises in perfect condition. However, we are not liable for any delay, damage, or loss occurring after handover to the Delivery Partner.",
      "Claims for damage or delay caused during transit should be raised directly with the Delivery Partner where applicable.",
    ],
  },
];

const refundClauses: Clause[] = [
  {
    title: "General Policy",
    intro:
      "At Flower School Bengaluru & Bouquet Bar, every floral arrangement is carefully handcrafted using fresh, perishable blooms. Due to the nature of our products, all sales are final, and we maintain a strict no refund policy once an order has been placed.",
  },
  {
    title: "Perishable Nature of Flowers",
    intro:
      "Flowers are natural and perishable products, and their lifespan depends on various factors such as temperature, handling, and care. As such, we cannot offer refunds or returns once the order has been delivered.",
  },
  {
    title: "Order Accuracy and Quality",
    intro:
      "We strive to ensure that every order matches the description and quality expected. However, minor variations in colour, shape, or size may occur due to seasonal and regional availability — these are not considered defects and do not qualify for a refund or replacement.",
  },
  {
    title: "Incorrect or Incomplete Delivery Information",
    intro:
      "Flower School Bengaluru & Bouquet Bar is not responsible for delays, failed deliveries, or incorrect items due to inaccurate or incomplete delivery details provided by the customer. In such cases, refunds will not be issued.",
  },
  {
    title: "Customer Responsibility",
    intro:
      "It is the customer's responsibility to provide correct delivery details and ensure recipient availability. Once an order is confirmed and prepared, it cannot be cancelled, refunded, or modified.",
  },
  {
    title: "Exceptional Cases",
    intro:
      "While refunds are not provided, we value our customers and are committed to resolving genuine concerns. If there is a clear issue with the quality or delivery of your order, please contact us within 24 hours of delivery, along with supporting photos. At our discretion, a replacement or store credit may be offered as a goodwill gesture — this does not constitute a change to our no refund policy.",
  },
];

function ClauseList({ clauses }: { clauses: Clause[] }) {
  return (
    <ol className="space-y-8">
      {clauses.map((clause, index) => (
        <li key={clause.title} className="flex gap-4">
          <span className="mt-0.5 w-6 shrink-0 text-right font-semibold text-pink-600">
            {index + 1}.
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {clause.title}
            </h3>
            {clause.intro && (
              <p className="mt-2 leading-relaxed text-gray-600">
                {clause.intro}
              </p>
            )}
            {clause.bullets && (
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-gray-600 marker:text-pink-400">
                {clause.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function TermsOfService() {
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
            Terms &amp; Services
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Understanding our delivery terms and refund policy helps ensure a
            smooth experience.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Last Updated: December 2024
          </p>

          <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-3 text-sm">
            <a
              href="#delivery"
              className="rounded-full border border-gray-300 px-4 py-1.5 text-gray-700 transition-colors hover:border-pink-400 hover:text-pink-700"
            >
              Delivery Terms
            </a>
            <a
              href="#refunds"
              className="rounded-full border border-gray-300 px-4 py-1.5 text-gray-700 transition-colors hover:border-pink-400 hover:text-pink-700"
            >
              No Refund Policy
            </a>
            <a
              href="#contact"
              className="rounded-full border border-gray-300 px-4 py-1.5 text-gray-700 transition-colors hover:border-pink-400 hover:text-pink-700"
            >
              Contact Us
            </a>
          </nav>
        </header>

        <section id="delivery" className="scroll-mt-8 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Delivery Terms &amp; Conditions
          </h2>
          <p className="mb-8 mt-1 text-gray-600">
            Important information about our delivery services and policies
          </p>
          <ClauseList clauses={deliveryClauses} />
        </section>

        <section
          id="refunds"
          className="scroll-mt-8 border-t border-gray-200 py-10"
        >
          <h2 className="text-2xl font-bold text-gray-900">No Refund Policy</h2>
          <p className="mb-8 mt-1 text-gray-600">
            Understanding our policy on returns and refunds
          </p>
          <ClauseList clauses={refundClauses} />
        </section>

        <section
          id="contact"
          className="scroll-mt-8 border-t border-gray-200 py-10"
        >
          <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
          <p className="mb-6 mt-1 text-gray-600">
            Have questions about our terms? We're here to help clarify.
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
                #440, 18th Main Rd, 6th Block
                <br />
                Koramangala, Bengaluru
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}