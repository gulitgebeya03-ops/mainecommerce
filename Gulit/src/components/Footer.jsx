import { Link } from "react-router-dom";
import { Phone, Mail, CreditCard } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-[#131921] text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Logo */}
          <div>
            <h2 className="text-2xl font-bold mb-3">
              ጉሊት
            </h2>

            <p className="text-gray-300 text-sm">
              Your trusted online marketplace.
            </p>
          </div>

          {/* Column 2: Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg tracking-wide border-b border-gray-800 pb-2">
              Company
            </h3>

            <nav aria-label="Company Links">
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-[#F4B400] focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-colors duration-200 block py-0.5 rounded"
                  >
                    About Us
                  </Link>
                </li>

                <li>
                  <Link
                    to="/careers"
                    className="hover:text-[#F4B400] focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-colors duration-200 block py-0.5 rounded"
                  >
                    Careers
                  </Link>
                </li>

                <li>
                  <a
                    href="tel:+251900000000"
                    className="hover:text-[#F4B400] focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-colors duration-200 flex items-center gap-2 py-0.5 rounded"
                  >
                    <Phone size={12} />
                    +251 900 000 000
                  </a>
                </li>

                <li>
                  <a
                    href="mailto:support@gulit.com"
                    className="hover:text-[#F4B400] focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-colors duration-200 flex items-center gap-2 py-0.5 rounded"
                  >
                    <Mail size={12} />
                    support@gulit.com
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg tracking-wide border-b border-gray-800 pb-2">
              Our Policies
            </h3>

            <nav aria-label="Policy Links">
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-[#F4B400] focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-colors duration-200 block py-0.5 rounded"
                  >
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <Link
                    to="/terms"
                    className="hover:text-[#F4B400] focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-colors duration-200 block py-0.5 rounded"
                  >
                    Terms & Conditions
                  </Link>
                </li>

                <li>
                  <Link
                    to="/returns"
                    className="hover:text-[#F4B400] focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-colors duration-200 block py-0.5 rounded"
                  >
                    Returns & Refunds
                  </Link>
                </li>

                <li>
                  <Link
                    to="/faq"
                    className="hover:text-[#F4B400] focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-colors duration-200 block py-0.5 rounded"
                  >
                    FAQs
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4 text-lg tracking-wide border-b border-gray-800 pb-2">
              Stay Updated
            </h3>

            <p className="text-sm text-gray-400">
              Subscribe to get special offers, free giveaways, and
              once-in-a-lifetime deals.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                placeholder="Your email address"
                autoComplete="email"
                aria-label="Email address"
                required
                className="bg-gray-800 text-white placeholder-gray-500 text-sm px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#F4B400] w-full transition duration-200"
              />

              <button
                type="submit"
                className="bg-[#F4B400] text-[#101828] font-medium text-sm px-4 py-2 rounded hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-[#F4B400] transition-colors duration-200 whitespace-nowrap"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">

          {/* Copyright */}
          <div className="text-sm text-gray-500 text-center md:text-left order-2 md:order-1">
            © {new Date().getFullYear()} ጉሊት. All Rights Reserved.
          </div>

          {/* Payment Methods */}
          <div className="flex flex-wrap items-center justify-center gap-2 order-1 md:order-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mr-1">
              We Accept:
            </span>

            <div className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-[10px] font-bold uppercase">
              telebirr
            </div>

            <div className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-[10px] font-bold uppercase">
              CBE Birr
            </div>

            <div className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-[10px] font-bold uppercase">
              Visa
            </div>

            <div className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-[10px] font-bold uppercase">
              Mastercard
            </div>

            <CreditCard size={18} className="text-gray-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;