import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, FileText, Globe } from 'lucide-react';
import { useEffect } from 'react';

export default function PrivacyPolicyView() {
  useEffect(() => {
    document.title = "Privacy Policy - QRPay Pro";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col space-y-4">
          <Link to="/" className="inline-flex items-center text-slate-500 hover:text-white transition text-xs font-semibold space-x-1.5 w-fit">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Privacy Policy</h1>
              <p className="text-xs text-slate-400 mt-1">Last updated: June 19, 2026</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-xl space-y-6 text-sm leading-relaxed text-slate-300">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Eye className="h-4.5 w-4.5 text-purple-400" />
              <span>1. Information We Collect</span>
            </h2>
            <p>
              To provide our verified QR payment solutions, we collect personal and business information when you register an account. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Profile data: Full name, business email, phone number, and password hashes.</li>
              <li>Business details: Registered store names, physical addresses, GSTIN numbers, and UPI VPA identifiers.</li>
              <li>Transaction history: Invoices generated, client details, transaction amounts, payment status, and order identifiers.</li>
            </ul>
          </section>

          <hr className="border-slate-800/80" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Lock className="h-4.5 w-4.5 text-purple-400" />
              <span>2. How We Secure Your Data</span>
            </h2>
            <p>
              Security is at the core of QRPay Pro. We implement industry-leading protocols to protect your merchant dashboard and payment links:
            </p>
            <p className="text-slate-400">
              Passwords are encrypted using Argon2 hashing algorithms. All network communications are secured using HTTPS/TLS channels. Refresh tokens are rotated dynamically, and backend sessions expire automatically. Payment gateway verifications use secure HMAC signature verification techniques to prevent transaction spoofing.
            </p>
          </section>

          <hr className="border-slate-800/80" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileText className="h-4.5 w-4.5 text-purple-400" />
              <span>3. Data Sharing & Third Parties</span>
            </h2>
            <p>
              We do not sell your personal or customer billing data. Information is only shared with verified third-party integrations needed to process payments (such as UPI service providers and gateway operators like Razorpay) or when legally required by law enforcement.
            </p>
          </section>

          <hr className="border-slate-800/80" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Globe className="h-4.5 w-4.5 text-purple-400" />
              <span>4. Merchant Control & Deletion Options</span>
            </h2>
            <p>
              We give merchants full command over their data. You can update your profile, add or remove UPI IDs, or permanently delete your account at any time through the Settings panel. Deleting your account instantly and permanently deletes your business details, customer tables, and payment history.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <p>© 2026 QRPay Pro. All rights reserved. Secure payment solutions.</p>
        </div>

      </div>
    </div>
  );
}
