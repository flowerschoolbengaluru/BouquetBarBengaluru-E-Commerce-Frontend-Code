import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

function Clause({
  number,
  title,
  children,
}: {
  number?: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex gap-4">
      <span className="mt-0.5 w-6 shrink-0 text-right font-semibold text-pink-600">
        {number ? `${number}.` : ""}
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

export default function DeliveryPolicy() {
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
            Delivery Terms &amp; Conditions
          </h1>
        </header>

        <div className="space-y-8 py-10">
          <Clause number={1} title="Delivery Coverage">
            <p>
              Flower School Bengaluru &amp; Bouquet Bar currently offers
              delivery services available across Bangalore. Deliveries outside
              these areas may be accommodated upon request and may be subject
              to additional delivery fees.
            </p>
          </Clause>

          <Clause number={2} title="Delivery Schedule">
            <Bullets
              items={[
                "Standard delivery hours are from 9:00 AM to 6:00 PM, Monday through Sunday.",
                "Same-day delivery is available for orders placed before 3:00 PM.",
                "While every effort will be made to deliver within the requested time slot, specific delivery times cannot be guaranteed due to variable traffic, weather, or operational conditions.",
              ]}
            />
          </Clause>

          <Clause number={3} title="Delivery Fees">
            <p>
              Delivery charges are determined based on the delivery location
              and type of service (standard, express, or midnight). The
              applicable fee will be displayed during checkout.
            </p>
          </Clause>

          <Clause number={4} title="Recipient Availability">
            <p>
              It is the customer's responsibility to ensure that the recipient
              is available to accept the delivery at the provided address. If
              the recipient is unavailable at the time of delivery:
            </p>
            <Bullets
              items={[
                "The delivery partner may contact the recipient or leave the order with a neighbour, security guard, or reception (if permitted).",
                "If delivery cannot be completed, a re-delivery fee may apply.",
              ]}
            />
          </Clause>

          <Clause number={5} title="Incorrect or Incomplete Address">
            <p>
              Flower School Bengaluru &amp; Bouquet Bar is not responsible for
              non-delivery or delays resulting from incorrect, incomplete, or
              insufficient delivery details provided by the customer. Please
              verify the address carefully before placing your order.
            </p>
          </Clause>

          <Clause number={6} title="Substitution Policy">
            <p>
              Due to seasonal and regional availability, certain flowers,
              wrapping materials, or containers may need to be substituted
              with similar items of equal or higher value. Such substitutions
              are made while maintaining the overall design, theme, and value
              of the arrangement.
            </p>
          </Clause>

          <Clause number={7} title="Delivery Delays">
            <p>
              In the event of unforeseen circumstances such as extreme weather
              conditions, traffic disruptions, strikes, or public holidays,
              deliveries may be delayed. Flower School Bengaluru &amp; Bouquet
              Bar will make every reasonable effort to notify customers and
              complete delivery as soon as possible.
            </p>
          </Clause>

          <Clause number={8} title="Order Modification and Cancellation">
            <Bullets
              items={[
                <>
                  <strong className="font-semibold text-gray-800">
                    Same-Day and Next-Day Deliveries:
                  </strong>{" "}
                  Cancellations or refunds are{" "}
                  <strong className="font-semibold text-gray-800">
                    not permitted
                  </strong>{" "}
                  for same-day or next-day deliveries, as order processing
                  begins immediately after confirmation.
                </>,
                <>
                  <strong className="font-semibold text-gray-800">
                    Advance Orders (Beyond Next-Day):
                  </strong>{" "}
                  Cancellations are allowed{" "}
                  <strong className="font-semibold text-gray-800">
                    within 24 hours of placing the order
                  </strong>
                  . Any requests made after this period will not be accepted.
                </>,
                <>
                  <strong className="font-semibold text-gray-800">
                    Delivery Fees:
                  </strong>{" "}
                  In the event of a cancellation after dispatch to the delivery
                  partner,{" "}
                  <strong className="font-semibold text-gray-800">
                    delivery charges are non-refundable
                  </strong>
                  .
                </>,
                "Once an order is prepared, dispatched, or delivered, it cannot be cancelled or refunded.",
              ]}
            />
          </Clause>

          <Clause number={9} title="Non-Delivery Due to Recipient Refusal">
            <p>
              If the recipient refuses to accept the delivery for any reason,
              the order will be considered delivered and no refund will be
              issued.
            </p>
          </Clause>

          <Clause number={10} title="Proof of Delivery">
            <p>
              Proof of delivery, such as a delivery photo, signature, or
              confirmation message, may be provided upon request for
              verification purposes.
            </p>
          </Clause>

          <Clause number={11} title="Contact Information">
            <p>
              For delivery-related inquiries or assistance, please contact us
              at:
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

          <Clause title="Third-Party Delivery Policy">
            <Bullets
              items={[
                "Once an order is handed over to a Delivery Partner, the responsibility for the safe and timely delivery of the product lies with them.",
                "We ensure all products leave our premises in perfect condition. However, we are not liable for any delay, damage, or loss occurring after handover to the Delivery Partner.",
                "Claims for damage or delay caused during transit should be raised directly with the Delivery Partner where applicable.",
              ]}
            />
          </Clause>
        </div>
      </div>
    </div>
  );
}