"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";

type ContactType = "general" | "bug" | "feature" | "support";

// Wrapper component to handle Suspense requirement for useSearchParams
export default function ContactPage() {
  return (
    <Suspense fallback={<ContactPageLoading />}>
      <ContactPageContent />
    </Suspense>
  );
}

function ContactPageLoading() {
  return (
    <div className="max-w-4xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="w-48 h-8 mb-2 bg-gray-200 rounded"></div>
        <div className="h-4 mb-8 bg-gray-200 rounded w-96"></div>
        <div className="card h-96"></div>
      </div>
    </div>
  );
}

function ContactPageContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as ContactType) || "general";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: initialType,
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (in production, this would send to an API)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    addToast({
      type: "success",
      title: "Message sent!",
      message: "We'll get back to you as soon as possible.",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
        <div className="py-12 text-center card">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Message Sent!</h1>
          <p className="mb-6 text-gray-600">
            Thank you for reaching out. We typically respond within 24-48 hours.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/" className="btn-secondary">
              Back to Home
            </a>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  type: "general",
                  subject: "",
                  message: "",
                });
              }}
              className="btn-primary"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Contact Us</h1>
      <p className="mb-8 text-gray-600">
        Have a question, found a bug, or want to suggest a feature? We'd love to hear from you.
      </p>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Contact Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="card">
            <div className="space-y-5">
              {/* Name & Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 transition-shadow border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 transition-shadow border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block mb-1 text-sm font-medium text-gray-700">
                  What's this about?
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 transition-shadow bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block mb-1 text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 transition-shadow border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block mb-1 text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 transition-shadow border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder={
                    formData.type === "bug"
                      ? "Please describe the bug, including steps to reproduce it, expected behavior, and what actually happened..."
                      : formData.type === "feature"
                      ? "Please describe the feature you'd like to see, why it would be useful, and any specific implementation ideas..."
                      : "How can we help you?"
                  }
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></span>
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="mb-4 font-semibold text-gray-900">Other Ways to Reach Us</h3>
            <div className="space-y-4">
              <ContactMethod
                icon="📧"
                label="Email"
                value="support@worksidesoftware.com"
                href="mailto:support@worksidesoft.com"
              />
              {/* <ContactMethod
                icon="🐦"
                label="Twitter"
                value="@WorksideSoftware"
                href="https://twitter.com/WorksideSoft"
              /> */}
            </div>
          </div>

          <div className="card bg-gray-50">
            <h3 className="mb-2 font-semibold text-gray-900">Response Time</h3>
            <p className="text-sm text-gray-600">
              We typically respond within 24-48 hours during business days. 
              For urgent issues, please indicate "URGENT" in the subject line.
            </p>
          </div>

          <div className="border-blue-200 card bg-blue-50">
            <h3 className="mb-2 font-semibold text-blue-900">Looking for Help?</h3>
            <p className="mb-3 text-sm text-blue-700">
              Check out our FAQ and Support pages for quick answers to common questions.
            </p>
            <div className="flex gap-2">
              <a href="/faq" className="text-sm text-blue-600 hover:underline">FAQ</a>
              <span className="text-blue-300">•</span>
              <a href="/support" className="text-sm text-blue-600 hover:underline">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactMethod({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <a
          href={href}
          className="font-medium text-brand hover:underline"
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {value}
        </a>
      </div>
    </div>
  );
}
