import Breadcrumb from "@/components/commons/breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Kaizen",
  description: "Privacy Policy for Kaizen healthcare platform",
};

const PrivacyPolicyPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Privacy Policy"
      />
      
      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-8/12">
              <div className="wow fadeInUp" data-wow-delay=".1s">
                
                {/* Introduction */}
                <div className="mb-12">
                  <h3 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Introduction
                  </h3>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    Welcome to Kaizen. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. Please read this privacy policy carefully.
                  </p>
                </div>

                {/* Information We Collect */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Information We Collect
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    We may collect information about you in a variety of ways:
                  </p>
                  <ul className="mb-4 ml-6 list-disc text-base font-medium leading-relaxed text-body-color marker:text-xl">
                    <li className="mb-2">Personal Information: Name, email address, phone number, and other contact details</li>
                    <li className="mb-2">Health Information: Medical history and health-related information you choose to share</li>
                    <li className="mb-2">Usage Data: Information about how you interact with our website and services</li>
                    <li className="mb-2">Device Information: IP address, browser type, operating system, and device identifiers</li>
                  </ul>
                </div>

                {/* How We Use Your Information */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    How We Use Your Information
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    We use the information we collect to:
                  </p>
                  <ul className="mb-4 ml-6 list-disc text-base font-medium leading-relaxed text-body-color marker:text-xl">
                    <li className="mb-2">Provide and maintain our services</li>
                    <li className="mb-2">Process and manage appointment bookings</li>
                    <li className="mb-2">Communicate with you about appointments and services</li>
                    <li className="mb-2">Improve our website and services</li>
                    <li className="mb-2">Send you relevant updates and promotional materials (with your consent)</li>
                    <li className="mb-2">Comply with legal obligations and protect our rights</li>
                  </ul>
                </div>

                {/* Information Sharing */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Information Sharing
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    We may share your information in the following situations:
                  </p>
                  <ul className="mb-4 ml-6 list-disc text-base font-medium leading-relaxed text-body-color marker:text-xl">
                    <li className="mb-2">With healthcare providers when you book appointments through our platform</li>
                    <li className="mb-2">With service providers who assist us in operating our website and services</li>
                    <li className="mb-2">When required by law or to protect our rights and safety</li>
                    <li className="mb-2">With your explicit consent for specific purposes</li>
                  </ul>
                </div>

                {/* Data Security */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Data Security
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    We implement appropriate security measures to protect your personal information:
                  </p>
                  <ul className="mb-4 ml-6 list-disc text-base font-medium leading-relaxed text-body-color marker:text-xl">
                    <li className="mb-2">Encryption of sensitive data in transit and at rest</li>
                    <li className="mb-2">Regular security audits and updates</li>
                    <li className="mb-2">Limited access to personal information on a need-to-know basis</li>
                    <li className="mb-2">Secure data storage and backup procedures</li>
                  </ul>
                </div>

                {/* Your Rights */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Your Rights
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    You have certain rights regarding your personal information:
                  </p>
                  <ul className="mb-4 ml-6 list-disc text-base font-medium leading-relaxed text-body-color marker:text-xl">
                    <li className="mb-2">Access: Request a copy of the personal information we hold about you</li>
                    <li className="mb-2">Correction: Request correction of inaccurate or incomplete information</li>
                    <li className="mb-2">Deletion: Request deletion of your personal information under certain circumstances</li>
                    <li className="mb-2">Portability: Request transfer of your data to another service provider</li>
                    <li className="mb-2">Opt-out: Unsubscribe from marketing communications at any time</li>
                  </ul>
                </div>

                {/* Cookies and Tracking */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Cookies and Tracking
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    We use cookies and similar tracking technologies to:
                  </p>
                  <ul className="mb-4 ml-6 list-disc text-base font-medium leading-relaxed text-body-color marker:text-xl">
                    <li className="mb-2">Remember your preferences and settings</li>
                    <li className="mb-2">Analyze website traffic and usage patterns</li>
                    <li className="mb-2">Provide personalized content and advertisements</li>
                    <li className="mb-2">Improve website functionality and user experience</li>
                  </ul>
                </div>

                {/* Third-Party Services */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Third-Party Services
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    Our website may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
                  </p>
                </div>

                {/* Data Retention */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Data Retention
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                  </p>
                </div>

                {/* Children's Privacy */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Children&apos;s Privacy
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                  </p>
                </div>

                {/* Changes to Privacy Policy */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Changes to Privacy Policy
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy periodically.
                  </p>
                </div>

                {/* Contact Us */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Contact Us
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="rounded-lg bg-primary/5 p-6 text-base font-medium leading-relaxed text-body-color">
                    <p className="mb-2">Email: privacy@kaizen.com</p>
                    <p className="mb-2">Phone: +1 (555) 123-4567</p>
                    <p>Address: 123 Healthcare Ave, Medical District, City, State 12345</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicyPage;