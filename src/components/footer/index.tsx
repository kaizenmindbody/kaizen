"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { showToast } from "@/lib/toast";

const Footer = () => {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const toastShownRef = useRef(false); // Use ref to persist across renders

  useEffect(() => {
    if (!formContainerRef.current) return;

    // Function to move and style ConvertKit form
    const moveAndStyleForm = (form: HTMLFormElement) => {
      if (!formContainerRef.current) return;
      
      // Move form to our container if it's not already there
      // Only clear if form is not already in the container
      if (form.parentElement !== formContainerRef.current) {
        // Check if container already has content
        const existingForm = formContainerRef.current.querySelector('form');
        if (!existingForm || existingForm !== form) {
          formContainerRef.current.innerHTML = '';
          formContainerRef.current.appendChild(form);
        }
      }
      
      // Apply styles to form
      form.style.display = 'flex';
      form.style.flexDirection = 'row';
      form.style.gap = '0';
      form.style.width = '100%';
      form.style.maxWidth = '20rem';
      form.style.margin = '0';
    };


    // Function to check for ConvertKit form
    const checkForForm = () => {
      if (!formContainerRef.current) return false;

      // Check if form is already in our container
      const existingForm = formContainerRef.current.querySelector('form');
      if (existingForm) {
        moveAndStyleForm(existingForm);
        return true;
      }

      // Look for ConvertKit form anywhere in the document
      const allForms = document.querySelectorAll('form');
      for (const form of Array.from(allForms)) {
        const action = form.getAttribute('action') || '';
        const formId = form.id || '';
        const className = form.className || '';
        
        // Check if this is a ConvertKit form
        if (
          action.includes('convertkit') || 
          action.includes('b5dc5d3bda') ||
          formId.includes('convertkit') ||
          className.includes('convertkit') ||
          className.includes('formkit') ||
          form.querySelector('[name*="email"]') // Has email field
        ) {
          moveAndStyleForm(form);
          return true;
        }
      }

      return false;
    };

    // Use MutationObserver to watch for ConvertKit injecting the form and success messages
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as HTMLElement;
            
            // Prevent hiding footer or form container
            if (element.closest('footer') || element.id === 'convertkit-form-container') {
              // Ensure footer and form container are always visible
              (element.closest('footer') as HTMLElement)?.setAttribute('style', 'display: block !important; visibility: visible !important;');
              return;
            }
            
            // Check if the added node is a form or contains a form
            if (element.tagName === 'FORM') {
              checkForForm();
            } else {
              const form = element.querySelector('form');
              if (form) {
                checkForForm();
              }
            }
            
            // Check for success messages and trigger toast immediately
            const text = (element.textContent || '').toLowerCase();
            if (
              !toastShownRef.current &&
              (text.includes('yay! welcome') || 
               text.includes('check your email') || 
               text.includes('confirm your subscription') ||
               text.includes('please check your email now'))
            ) {
              // Hide immediately with important flags
              const htmlEl = element as HTMLElement;
              htmlEl.style.setProperty('display', 'none', 'important');
              htmlEl.style.setProperty('visibility', 'hidden', 'important');
              htmlEl.style.setProperty('opacity', '0', 'important');
              htmlEl.setAttribute('data-toast-shown', 'true');
              
              // Show toast immediately
              if (!toastShownRef.current) {
                toastShownRef.current = true;
                showToast.success('Thank you for subscribing! Please check your email to confirm your subscription.');
              }
              
              // Also trigger detection for any nested elements
              detectSubscriptionSuccess();
            }
          }
        });
      });
    });

    // Observe the entire document body for new form elements
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Function to detect ConvertKit subscription success and show toast (only once)
    const detectSubscriptionSuccess = () => {
      if (toastShownRef.current) return;

      const successTexts = [
        'Yay! Welcome',
        'check your email',
        'confirm your subscription',
        'Please check your email',
        'please check your email now'
      ];

      const checkForSuccess = () => {
        if (toastShownRef.current) return false;

        // Check all elements including those that might contain the message
        const allElements = document.querySelectorAll('*');
        for (const el of Array.from(allElements)) {
          const text = (el.textContent || '').trim();
          
          // Check if this element contains the success message
          const hasSuccessText = successTexts.some(successText => 
            text.toLowerCase().includes(successText.toLowerCase())
          );

          // Also check for exact match
          const isExactMatch = text.includes('Yay! Welcome') && 
                               (text.includes('check your email') || text.includes('confirm your subscription'));

          if (hasSuccessText || isExactMatch) {
            // Skip if it's a form, container, wrapper, or footer
            if (
              el.tagName === 'FORM' ||
              el.closest('form') ||
              el.closest('#convertkit-form-container') ||
              el.closest('.convertkit-form-wrapper') ||
              el.closest('footer') ||
              (el as HTMLElement).hasAttribute('data-toast-shown')
            ) {
              continue;
            }

            // Mark as processed
            (el as HTMLElement).setAttribute('data-toast-shown', 'true');
            toastShownRef.current = true;
            
            // Hide ConvertKit success message immediately with multiple methods
            const htmlEl = el as HTMLElement;
            htmlEl.style.setProperty('display', 'none', 'important');
            htmlEl.style.setProperty('visibility', 'hidden', 'important');
            htmlEl.style.setProperty('opacity', '0', 'important');
            htmlEl.style.setProperty('height', '0', 'important');
            htmlEl.style.setProperty('overflow', 'hidden', 'important');
            htmlEl.style.setProperty('position', 'absolute', 'important');
            htmlEl.style.setProperty('left', '-9999px', 'important');
            htmlEl.style.setProperty('width', '0', 'important');
            htmlEl.style.setProperty('margin', '0', 'important');
            htmlEl.style.setProperty('padding', '0', 'important');
            
            // Also hide parent if it only contains this message
            const parent = el.parentElement;
            if (parent && !parent.closest('form') && !parent.closest('footer')) {
              const parentText = (parent.textContent || '').trim();
              if (parentText === text || parentText.toLowerCase().includes('yay! welcome')) {
                (parent as HTMLElement).style.setProperty('display', 'none', 'important');
              }
            }
            
            // Show toast notification instead (only if not shown yet)
            if (!toastShownRef.current) {
              showToast.success('Thank you for subscribing! Please check your email to confirm your subscription.');
            }
            
            return true;
          }
        }
        return false;
      };

      // Check immediately
      checkForSuccess();

      // Check very frequently to catch it as soon as it appears
      const successInterval = setInterval(() => {
        if (checkForSuccess() || toastShownRef.current) {
          clearInterval(successInterval);
        }
      }, 50); // Check every 50ms for faster detection

      // Stop checking after 20 seconds max
      setTimeout(() => {
        clearInterval(successInterval);
      }, 20000);
    };

    // Also check periodically as a fallback
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(() => {
      attempts++;
      const found = checkForForm();
      if (found || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 500);

    // Initial check
    checkForForm();
    
    // Start checking for subscription success
    detectSubscriptionSuccess();

    // Ensure footer is always visible - prevent it from being hidden
    const ensureFooterVisible = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        (footer as HTMLElement).style.display = 'block';
        (footer as HTMLElement).style.visibility = 'visible';
        (footer as HTMLElement).style.opacity = '1';
      }
      
      // Ensure form container is visible
      if (formContainerRef.current) {
        formContainerRef.current.style.display = 'block';
        formContainerRef.current.style.visibility = 'visible';
        formContainerRef.current.style.opacity = '1';
      }
    };

    // Check footer visibility periodically
    const footerCheckInterval = setInterval(() => {
      ensureFooterVisible();
    }, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      clearInterval(footerCheckInterval);
    };
  }, []);

  return (
    <>
      <footer className="font-sans relative bg-[#8ED08380] pt-12 dark:bg-gray-dark sm:pt-16 md:pt-20 lg:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Logo and Description */}
            <div className="text-center md:text-left">
              <div className="max-w-[360px] mx-auto md:mx-0 lg:mb-16">
                <Link href="/" className="mb-6 sm:mb-8 inline-block">
                  <Image
                    src="/images/logo.png"
                    width={140}
                    height={30}
                    alt="logo"
                    className="w-full h-full"
                  />
                </Link>
                <p className="mb-6 sm:mb-9 text-sm sm:text-base leading-relaxed text-secondary">
                  Effortlessly discover licensed acupuncturists, exciting wellness events and shop thoughtfully crafted TCM products with Kaizen.  Prioritize your well-being by learning about your healthcare options and educate yourself on the powers of TCM and acupuncture.
                </p>
              </div>
            </div>

            {/* Company Links */}
            <div className="font-semibold text-secondary text-center md:text-left mb-4 lg:mb-0">
              <div className="lg:mb-16 md:px-8">
                <h2 className="mb-6 sm:mb-8 lg:mb-10 text-lg sm:text-xl font-bold">
                  Company
                </h2>
                <ul className="space-y-1 sm:space-y-0">
                  <li>
                    <Link
                      href="/about-us"
                      className="block sm:mb-4 text-sm sm:text-base duration-300 hover:text-primary py-1"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq"
                      className="block sm:mb-4 text-sm sm:text-base duration-300 hover:text-primary py-1"
                    >
                      FAQs
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Legal Links */}
            <div className="font-semibold text-secondary text-center md:text-left mb-4 lg:mb-0">
              <div className="lg:mb-16 md:px-8">
                <h2 className="mb-6 sm:mb-8 lg:mb-10 text-lg sm:text-xl font-bold">
                  Legal
                </h2>
                <ul className="space-y-1 sm:space-y-0">
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="block sm:mb-4 text-sm sm:text-base duration-300 hover:text-primary py-1"
                    >
                      Data and Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-conditions"
                      className="block sm:mb-4 text-sm sm:text-base duration-300 hover:text-primary py-1"
                    >
                      Terms and Conditions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter Section - ConvertKit */}
            <div className="font-semibold text-secondary text-center md:text-left">
              <div className="lg:mb-16">
                <h2 className="mb-6 sm:mb-8 lg:mb-10 text-lg sm:text-xl font-bold text-secondary">
                  Join Our Wellness Community
                </h2>
                {/* ConvertKit Form Embed */}
                <div 
                  ref={formContainerRef}
                  className="convertkit-form-wrapper"
                  data-uid="b5dc5d3bda"
                  id="convertkit-form-container"
                />
                {/* ConvertKit Script - Load after container is ready */}
                <Script
                  id="convertkit-script"
                  strategy="afterInteractive"
                  onLoad={() => {
                    // Trigger form check after script loads
                    setTimeout(() => {
                      if (formContainerRef.current) {
                        const event = new Event('convertkit-loaded');
                        window.dispatchEvent(event);
                      }
                    }, 1000);
                  }}
                >
                  {`
                    (function() {
                      var script = document.createElement('script');
                      script.async = true;
                      script.setAttribute('data-uid', 'b5dc5d3bda');
                      script.src = 'https://modern-aging.kit.com/b5dc5d3bda/index.js';
                      document.body.appendChild(script);
                    })();
                  `}
                </Script>
              </div>
            </div>

            
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-4 sm:py-6 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <p className="text-center sm:text-left text-sm sm:text-base text-white order-2 sm:order-1">
                Copyright &copy; {new Date().getFullYear()} Kaizen. All Rights Reserved
              </p>
              <div className="flex items-center space-x-2 sm:space-x-4 order-1 sm:order-2">
                <a
                  href="/privacy-policy"
                  className="text-white hover:text-primary transition-colors duration-200 text-sm sm:text-base"
                >
                  Privacy Policy
                </a>
                <span className="text-white text-sm sm:text-base">|</span>
                <a
                  href="/terms-conditions"
                  className="text-white hover:text-primary transition-colors duration-200 text-sm sm:text-base"
                >
                  Terms & Conditions
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;