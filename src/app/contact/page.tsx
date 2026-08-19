"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { sendContactMessage } from "@/lib/emailjs";
import siteConfig from "@/lib/siteConfig";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PK_PHONE_REGEX = /^(\+92|0)[3][0-9]{9}$/;

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!EMAIL_REGEX.test(form.email)) e.email = "Valid email is required";
    if (form.phone && !PK_PHONE_REGEX.test(form.phone)) e.phone = "Enter a valid Pakistani phone number (e.g., 03001234567)";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.trim().length < 10) e.message = "Message must be at least 10 characters";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSubmitting(true);
    try {
      await sendContactMessage(form);
      setSubmitted(true);
      toast.success("Message Sent", "Our concierge will respond within 24 hours.");
    } catch {
      toast.error("Submission failed", "Please reach out directly via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    { icon: Phone, label: "Direct Phone / SMS", value: siteConfig.contactPhone, href: `tel:${siteConfig.contactPhone}` },
    { icon: Mail, label: "Official Inquiries", value: siteConfig.contactEmail, href: `mailto:${siteConfig.contactEmail}` },
    { icon: MapPin, label: "Lahore Flagship", value: siteConfig.address, href: `https://maps.google.com/?q=${encodeURIComponent(siteConfig.address)}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#FBF9F6] border-b border-[#E5E7EB] py-14 lg:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#A3845A] uppercase">
            Client Concierge
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#111827] font-normal">
            Get In Touch
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] font-sans leading-relaxed pt-1">
            Whether you have questions regarding sizing, custom stitching, or corporate gifting, our Lahore team is at your service.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Direct Contacts */}
          <div className="lg:col-span-5 space-y-6">
            {contactItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.icon === MapPin ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-6 bg-[#FBF9F6] border border-[#E5E7EB] hover:border-[#111827] transition-all group"
              >
                <div className="w-10 h-10 border border-[#111827] flex items-center justify-center text-[#111827] bg-white group-hover:bg-[#111827] group-hover:text-white transition-colors shrink-0">
                  <item.icon className="w-4 h-4 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#6B7280] font-sans uppercase tracking-widest font-semibold mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-sans font-medium text-[#111827]">
                    {item.value}
                  </p>
                </div>
              </a>
            ))}

            {/* WhatsApp Priority Card */}
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 bg-emerald-900 text-white border border-emerald-950 hover:bg-emerald-950 transition-colors group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="font-serif text-lg font-medium">WhatsApp Direct Line</p>
                <p className="text-xs text-white/80 font-sans mt-0.5">
                  Instant stylist responses (Mon – Sat, 11 AM – 9 PM)
                </p>
              </div>
            </a>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-10 bg-[#FBF9F6] border border-[#E5E7EB]"
              >
                <CheckCircle className="w-12 h-12 text-emerald-700 mb-4" />
                <h2 className="font-serif text-2xl text-[#111827] mb-2 font-normal">
                  Thank You for Writing
                </h2>
                <p className="text-xs text-[#6B7280] font-sans max-w-sm">
                  Your message has reached our team. A client consultant will reply within 24 business hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                  }}
                  className="luxury-btn-outline mt-6"
                >
                  Send Another Inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 sm:p-10 bg-[#FBF9F6] border border-[#E5E7EB] space-y-5">
                <div>
                  <h2 className="font-serif text-2xl text-[#111827] font-normal">Send an Inquiry</h2>
                  <p className="text-xs text-[#6B7280] font-sans mt-1">Please fill in your details below.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: "name", label: "Full Name", placeholder: "e.g. Ayesha Siddiqui", type: "text" },
                    { name: "email", label: "Email Address", placeholder: "ayesha@example.com", type: "email" },
                    { name: "phone", label: "Phone (Optional)", placeholder: "0300 1234567", type: "tel" },
                    { name: "subject", label: "Subject", placeholder: "Custom size, delivery inquiry...", type: "text" },
                  ].map((field) => (
                    <div key={field.name} className={field.name === "subject" ? "sm:col-span-2" : ""}>
                      <label htmlFor={`contact-${field.name}`} className="block text-xs font-sans font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                        {field.label}
                      </label>
                      <input
                        id={`contact-${field.name}`}
                        type={field.type}
                        value={(form as Record<string, string>)[field.name]}
                        onChange={(e) => {
                          setForm(p => ({ ...p, [field.name]: e.target.value }));
                          setErrors(p => ({ ...p, [field.name]: "" }));
                        }}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-3 bg-white border text-xs font-sans outline-none transition-colors ${
                          errors[field.name] ? "border-red-400" : "border-[#D1D5DB] focus:border-[#111827]"
                        }`}
                      />
                      {errors[field.name] && <p className="text-[11px] text-red-600 font-sans mt-1">{errors[field.name]}</p>}
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label htmlFor="contact-message" className="block text-xs font-sans font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Your Message
                    </label>
                    <textarea
                      id="contact-message"
                      value={form.message}
                      onChange={(e) => {
                        setForm(p => ({ ...p, message: e.target.value }));
                        setErrors(p => ({ ...p, message: "" }));
                      }}
                      placeholder="Please tell us how we can assist you..."
                      rows={5}
                      className={`w-full px-4 py-3 bg-white border text-xs font-sans outline-none transition-colors resize-none ${
                        errors.message ? "border-red-400" : "border-[#D1D5DB] focus:border-[#111827]"
                      }`}
                    />
                    {errors.message && <p className="text-[11px] text-red-600 font-sans mt-1">{errors.message}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full luxury-btn-primary py-4 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Inquiry"}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
