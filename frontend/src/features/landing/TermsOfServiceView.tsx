import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, CheckCircle2, ShieldAlert, Award, FileText } from 'lucide-react';
import { useEffect } from 'react';

export default function TermsOfServiceView() {
  useEffect(() => {
    document.title = "Terms of Service - QRPay Pro";
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
              <Scale className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Terms of Service</h1>
              <p className="text-xs text-slate-400 mt-1">Effective Date: June 19, 2026</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-xl space-y-6 text-sm leading-relaxed text-slate-300">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-purple-400" />
              <span>1. Agreement & Acceptance</span>
            </h2>
            <p>
              By registering a merchant account or using the QRPay Pro platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not access our payment services.
            </p>
          </section>

          <hr className="border-slate-800/80" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileText className="h-4.5 w-4.5 text-purple-400" />
              <span>2. Merchant Account Responsibilities</span>
            </h2>
            <p>
              When utilizing our QR billing generator or payment verification APIs:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>You must provide accurate and verifiable business credentials, including legal name and UPI VPA addresses.</li>
              <li>You are solely responsible for keeping your login credentials secure and confidential.</li>
              <li>You must ensure that all products, services, and transactions recorded through our platform comply with local regulations and commercial laws.</li>
            </ul>
          </section>

          <hr className="border-slate-800/80" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="h-4.5 w-4.5 text-purple-400" />
              <span>3. Prohibited Activities</span>
            </h2>
            <p>
              You agree not to use QRPay Pro to process payments for restricted or illegal items, commit financial fraud, bypass payment verification procedures, or disrupt the operation of our cloud servers and databases.
            </p>
          </section>

          <hr className="border-slate-800/80" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Award className="h-4.5 w-4.5 text-purple-400" />
              <span>4. Limitation of Liability</span>
            </h2>
            <p>
              QRPay Pro serves as a payment billing interface and dynamic links compiler. We do not hold, store, or process funds directly (all settlements happen over peer-to-peer UPI apps or licensed gateways). We are not responsible for transactions that fail due to bank network issues, VPA misconfigurations, or customer app errors.
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
