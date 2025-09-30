import Breadcrumb from "@/components/commons/breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Kaizen",
  description: "Terms and Conditions for Kaizen healthcare platform",
};

const TermsConditionsPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Terms & Conditions"
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
                    Welcome to Doccure, a platform that allows you to book appointments with healthcare professional. By using our services, you agree to these Terms & Conditions. Please them carefully before processing.
                  </p>
                </div>

                {/* User Responsibilities */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    User Responsibilities
                  </h2>
                  <ul className="mb-4 ml-6 list-disc text-base font-medium leading-relaxed text-body-color marker:text-xl">
                    <li className="mb-2">You must be at least 18 years old to use this website or have parental/guardian consent.</li>
                    <li className="mb-2">Ensure that all information provided is accurate and up-to-date.</li>
                    <li className="mb-2">You are responsibile for maintaining the confidentiality of your account and password.</li>
                  </ul>
                </div>

                {/* Booking Appointment */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Booking Appointment
                  </h2>
                  <ul className="mb-4 ml-6 list-disc text-base font-medium leading-relaxed text-body-color marker:text-xl">
                    <li className="mb-2">Appointments are booked in real-time, subject to availbility.</li>
                    <li className="mb-2">Users are responsible for attending the scheduled appointments or canceling in a timely manner.</li>
                    <li className="mb-2">Cancellations should be made before the appointment to avoid any penalties.</li>
                  </ul>
                </div>

                {/* Medical Disclaimer */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Medical Disclaimer
                  </h2>
                  <ul className="mb-4 ml-6 list-disc text-base font-medium leading-relaxed text-body-color marker:text-xl">
                    <li className="mb-2">Doccure provides a platform for scheduling appointments and is not responsible for the medical services provided.</li>
                    <li className="mb-2">Healthcare providers listed on the platform are independent practitioners, and [Website Name] does not guarantee the quality or accuracy of medical advice provided.</li>
                  </ul>
                </div>

                {/*  Payment & Fees */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Payment & Fees
                  </h2>
                  <ul className="mb-4 ml-6 list-disc text-base font-medium leading-relaxed text-body-color marker:text-xl">
                    <li className="mb-2">Payment for appointments may be made through [Payment Method] and is subject to [Insert Payment Terms].</li>
                    <li className="mb-2">Any additional fees, such as cancellation or no-show fees, will be disclosed at the time of booking.</li>
                  </ul>
                </div>

                {/* Change to Terms & Conditions */}
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-bold text-secondary dark:text-white sm:text-xl">
                    Change to Terms & Conditions
                  </h2>
                  <p className="mb-4 text-base font-medium leading-relaxed text-body-color">
                    Doccure may update these Terms & Conditions periodically. Any changes will be communicated through the website or via email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsConditionsPage;