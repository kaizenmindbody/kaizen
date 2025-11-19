"use client";

import { useState } from 'react';

interface FAQ {
  question: string;
  answer: React.ReactNode;
}

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const faqs: FAQ[] = [
    {
      question: "How do I create my first event on Kaizen?",
      answer: (
        <div className="space-y-3">
          <ol className="list-decimal list-inside space-y-2">
            <li>Click <strong>Create Event</strong> on your dashboard</li>
            <li>Fill in all key details:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Event name</li>
                <li>Description and summary</li>
                <li>Location</li>
                <li>Price and number of tickets</li>
              </ul>
            </li>
            <li>Upload a relevant and striking image for your event photo</li>
            <li>Choose one of the following:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li><strong>Save, I will Finish Later</strong> - if you are not ready to publish</li>
                <li><strong>Publish</strong> - to make your event live</li>
              </ul>
            </li>
            <li>Share your event across social media for greater visibility</li>
          </ol>
        </div>
      )
    },
    {
      question: "How do I sell tickets for my events?",
      answer: (
        <div className="space-y-3">
          <ol className="list-decimal list-inside space-y-2">
            <li>For paid events, ensure your Stripe account is connected:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Go to <strong>Manage an Event</strong></li>
                <li>Click <strong>Get Started</strong> to connect or create your Stripe account</li>
              </ul>
            </li>
            <li>Set ticket prices, type, and quantity for sale</li>
            <li>Submit event for approval</li>
            <li>Monitor ticket sales from your dashboard</li>
          </ol>
          <p className="text-sm text-gray-600 mt-2">📧 You will receive an email notification each time a ticket is purchased</p>
        </div>
      )
    },
    {
      question: "How do I create or connect my Stripe account for ticketing?",
      answer: (
        <div className="space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            <li>Click on <strong>Manage an Event</strong></li>
            <li>Go to <strong>Get Started</strong> under Sell Tickets</li>
            <li>Follow the instructions to log in or create a Stripe account</li>
          </ol>
        </div>
      )
    },
    {
      question: "How much commission do I have to pay on the ticket sales?",
      answer: (
        <div className="space-y-3">
          <p className="font-medium">Ticket commissions are based on ticket price:</p>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Ticket Price</th>
                  <th className="px-4 py-2 text-left font-semibold">Commission</th>
                  <th className="px-4 py-2 text-left font-semibold">You Keep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2">$0 - $200</td>
                  <td className="px-4 py-2">8%</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">92%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">$201 - $1,000</td>
                  <td className="px-4 py-2">6%</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">95%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">$1,000+</td>
                  <td className="px-4 py-2">4%</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">97%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600">💰 Earned revenue is paid directly to your Stripe account</p>
          <p className="text-xs text-gray-500 italic">These commissions help cover credit card charges, software, and staff to manage events.</p>
        </div>
      )
    },
    {
      question: "How does ticket revenue get split and when can I expect to receive the proceeds from the event?",
      answer: (
        <div className="space-y-3">
          <p className="font-medium">Ticket commissions are based on ticket price:</p>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Ticket Price</th>
                  <th className="px-4 py-2 text-left font-semibold">Commission</th>
                  <th className="px-4 py-2 text-left font-semibold">You Keep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2">$0 - $200</td>
                  <td className="px-4 py-2">8%</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">92%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">$201 - $1,000</td>
                  <td className="px-4 py-2">6%</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">95%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">$1,000+</td>
                  <td className="px-4 py-2">4%</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">97%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm"><strong>Ticket Buyer Fee:</strong> $2.50 flat fee per ticket</p>
          </div>
          <p className="text-sm text-gray-600">💰 Earned revenue is paid directly to your Stripe account</p>
          <p className="text-xs text-gray-500 italic">These commissions help cover credit card charges, software, and staff to manage events.</p>
        </div>
      )
    },
    {
      question: "How is ticket revenue processed?",
      answer: (
        <div className="space-y-3">
          <p>Ticket sales are processed via <strong>Stripe</strong> and will be transferred to your connected account within <strong className="text-primary">1-3 business days</strong>.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm">📊 Review your payment history:</p>
            <p className="text-sm mt-1"><strong>Manage Events</strong> → <strong>Manage Payments</strong></p>
          </div>
        </div>
      )
    },
    {
      question: "How do I get paid for my events?",
      answer: (
        <div className="space-y-3">
          <p>When you create a Stripe account, your revenue portion of the ticket sales will be automatically paid to your account.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm"><strong>⚠️ Not seeing revenue?</strong></p>
            <p className="text-sm mt-1">Email us at <a href="mailto:help@kaizenmindbody.com" className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-semibold hover:underline transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              help@kaizenmindbody.com
            </a></p>
          </div>
        </div>
      )
    },
    {
      question: "What if I have issues with payment?",
      answer: (
        <div className="space-y-3">
          <p className="font-medium">Troubleshooting steps:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Verify your Stripe account is connected at the top of the <strong>Manage an Event</strong> page</li>
            <li>For failed payments, check your Stripe dashboard by clicking <strong>Manage Payments</strong></li>
          </ol>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm">Still having issues? Email <a href="mailto:help@kaizenmindbody.com" className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-semibold hover:underline transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              help@kaizenmindbody.com
            </a></p>
          </div>
        </div>
      )
    },
    {
      question: "How do I edit my event once it has been published?",
      answer: (
        <div className="space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            <li>Click on <strong>Manage an Event</strong></li>
            <li>Click on <strong>Edit</strong></li>
            <li>Make desired changes to your event</li>
            <li>Be sure to click <strong className="text-primary">Save</strong> after making changes</li>
          </ol>
        </div>
      )
    },
    {
      question: "I want to reschedule or cancel my event",
      answer: (
        <div className="space-y-3">
          <div>
            <p className="font-medium mb-2">To reschedule:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to <strong>Manage an Event</strong></li>
              <li>Find your event and click <strong>Edit</strong></li>
              <li>Update the date/time and save</li>
            </ol>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="font-medium text-red-900">To cancel with sold tickets:</p>
            <p className="text-sm mt-1">Email us at <a href="mailto:help@kaizenmindbody.com" className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-semibold hover:underline transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              help@kaizenmindbody.com
            </a> to coordinate refunds</p>
          </div>
        </div>
      )
    },
    {
      question: "How do I manage attendees and check in guests?",
      answer: (
        <div className="space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to <strong>Manage an Event</strong></li>
            <li>Click on the <strong>3 dots</strong> (⋮) on the right side of your event</li>
            <li>Select <strong>Attendee List</strong></li>
            <li>Check in attendees as they arrive and view ticket purchase details</li>
          </ol>
        </div>
      )
    },
    {
      question: "How do I offer discount tickets to my events?",
      answer: (
        <div className="space-y-2">
          <p>Navigate to <strong>Events</strong> → <strong>Manage Coupons</strong></p>
          <p className="text-sm text-gray-600">Here you can create and manage coupons and discounts for your event tickets.</p>
        </div>
      )
    },
    {
      question: "What if I want to post a free event?",
      answer: (
        <div className="space-y-2">
          <p>Simply enter <strong className="text-gray-900">$0</strong> in the ticket price field when creating your event.</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm">✓ Free events are a great way to build community and attract attendees!</p>
          </div>
        </div>
      )
    },
  ];

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(faq => {
    const searchLower = searchQuery.toLowerCase();
    // Search in question only since answer is now a React element
    return faq.question.toLowerCase().includes(searchLower);
  });

  // Toggle expand/collapse for FAQ item
  const toggleExpand = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Help Center</h2>
        <p className="text-gray-600">We are here to answer any questions you have. If you do not find your answer here, please email us at <a href="mailto:help@kaizenmindbody.com" className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-semibold hover:underline transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          help@kaizenmindbody.com
        </a></p>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Frequently Asked Questions
          {searchQuery && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'})
            </span>
          )}
        </h3>
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-primary hover:underline text-sm"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFaqs.map((faq, index) => {
              const isExpanded = expandedItems.has(index);
              return (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleExpand(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="text-base font-semibold text-gray-900 pr-4">{faq.question}</h4>
                    <svg
                      className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                      <div className="text-sm text-gray-700 pt-3">{faq.answer}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h4 className="text-base font-semibold text-gray-900 mb-2">User Guide</h4>
          <p className="text-sm text-gray-600">Complete guide to using Kaizen</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-base font-semibold text-gray-900 mb-2">Video Tutorials</h4>
          <p className="text-sm text-gray-600">Watch step-by-step tutorials</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 className="text-base font-semibold text-gray-900 mb-2">Contact Support</h4>
          <p className="text-sm text-gray-600">Get help from our team</p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
