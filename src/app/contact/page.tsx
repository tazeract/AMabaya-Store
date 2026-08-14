"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
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
    if (form.phone && !PK_PHONE_REGEX.test(form.phone)) e.phone = "Enter a valid Pakistani number";
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
      toast.success("Message sent!", "We'll get back to you within 24 hours.");
    } catch {
      toast.error("Failed to send", "Please try WhatsApp instead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    { icon: Phone, label: "Call / SMS", value: siteConfig.contactPhone, href: `tel:${siteConfig.contactPhone}` },
    { icon: Mail, label: "Email", value: siteConfig.contactEmail, href: `mailto:${siteConfig.contactEmail}` },
    { icon: MapPin, label: "Address", value: siteConfig.address, href: `https://maps.google.com/?q=${encodeURIComponent(siteConfig.address)}` },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Header */}
      <div className="bg-white border-b border-[var(--color-border)] py-16 px-4 sm:px-6 text-center">
        <AnimatedSection>
          <span className="text-[var(--color-gold)] text-xs uppercase tracking-widest block mb-3">✦ Get In Touch</span>
          <h1 className="font-display text-5xl font-semibold text-[var(--color-text-primary)] mb-4">Contact Us</h1>
          <p className="text-[var(--color-text-secondary)] max-w-md mx-auto text-sm">
            We&apos;re here to help. Whether it&apos;s a sizing question or a custom order — reach out!
          </p>
        </AnimatedSection>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            {contactItems.map((item) => (
              <AnimatedSection key={item.label} direction="left">
                <a href={item.href} target={item.icon === MapPin ? "_blank" : undefined} rel="noopener noreferrer"
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.value}</p>
                  </div>
                </a>
              </AnimatedSection>
            ))}

            {/* WhatsApp CTA */}
            <AnimatedSection delay={0.2} direction="left">
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn flex items-center gap-3 p-5 rounded-2xl text-white"
              >
                <MessageCircle className="w-6 h-6" />
                <div>
                  <p className="font-semibold text-sm">Chat on WhatsApp</p>
                  <p className="text-xs text-white/70">Usually replies within 1 hour</p>
                </div>
              </a>
            </AnimatedSection>
          </div>

          {/* Contact form */}
          <AnimatedSection direction="right" className="lg:col-span-3">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-16"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="font-display text-2xl font-semibold text-[var(--color-text-primary)] mb-2">Message Sent!</h2>
                <p className="text-[var(--color-text-muted)] text-sm max-w-sm">
                  Thank you for reaching out. We&apos;ll reply within 24 hours.
                </p>
                <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="mt-6 px-6 py-3 border border-[var(--color-gold)] text-[var(--color-gold)] rounded-full text-sm hover:bg-[var(--color-gold)] hover:text-white transition-all"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[var(--color-border)] p-8 space-y-5">
                <h2 className="font-display text-2xl font-semibold text-[var(--color-text-primary)] mb-2">Send Us a Message</h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    { name: "name", label: "Your Name", placeholder: "Fatima Khan", type: "text" },
                    { name: "email", label: "Email Address", placeholder: "your@email.com", type: "email" },
                    { name: "phone", label: "Phone (optional)", placeholder: "03XX-XXXXXXX", type: "tel" },
                    { name: "subject", label: "Subject", placeholder: "Size inquiry, custom order...", type: "text" },
                  ].map((field) => (
                    <div key={field.name} className={field.name === "subject" ? "sm:col-span-2" : ""}>
                      <label htmlFor={`contact-${field.name}`} className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
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
                        className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${
                          errors[field.name] ? "border-red-400 bg-red-50" : "border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20"
                        }`}
                      />
                      {errors[field.name] && <p className="text-xs text-red-500 mt-1">{errors[field.name]}</p>}
                    </div>
                  ))}

                  {/* Message */}
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-message" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Message</label>
                    <textarea
                      id="contact-message"
                      value={form.message}
                      onChange={(e) => { setForm(p => ({ ...p, message: e.target.value })); setErrors(p => ({ ...p, message: "" })); }}
                      placeholder="How can we help you?"
                      rows={5}
                      className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all resize-none ${
                        errors.message ? "border-red-400 bg-red-50" : "border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20"
                      }`}
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="contact-submit-btn"
                  className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-sm transition-all ${
                    isSubmitting
                      ? "bg-[var(--color-gold)]/60 text-white cursor-wait"
                      : "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white shadow-[var(--shadow-gold)] hover:-translate-y-0.5 hover:shadow-xl"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
