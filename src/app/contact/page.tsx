"use client";

import Breadcrumb from "@/components/commons/breadcrumb";
import { Metadata } from "next";
import { useState } from "react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        // Handle error
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Breadcrumb
        pageName="Contact Us"
      />

      {/* Contact Section */}
      <section className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="flex items-center justify-center">
            <div className="w-full px-4 lg:w-1/2">
              <div className="relative rounded-lg bg-green-50 p-8 shadow-lg dark:bg-dark-2 sm:p-12">
                {showSuccess && (
                  <div className="mb-6 rounded-md bg-green-100 border border-green-400 text-green-700 px-4 py-3 text-center">
                    <p className="font-medium">Thank you for your message.</p>
                    <p>We truly care about your health and well-being. We will reply to you as soon as possible!</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label
                      htmlFor="name"
                      className="mb-3 block text-base font-medium text-dark dark:text-white"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      required
                      className="w-full rounded-md border border-transparent bg-white py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="email"
                      className="mb-3 block text-base font-medium text-dark dark:text-white"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your Email"
                      required
                      className="w-full rounded-md border border-transparent bg-white py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="message"
                      className="mb-3 block text-base font-medium text-dark dark:text-white"
                    >
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Your Message"
                      required
                      className="w-full resize-none rounded-md border border-transparent bg-white py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                    ></textarea>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-md bg-secondary py-4 px-9 text-base font-medium text-white transition duration-300 hover:bg-secondary/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;