import Link from 'next/link'
import { User, Building2, ArrowRight } from 'lucide-react'

export default function JoinPage() {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Join TrustGrid</h1>
        <p className="text-gray-500 text-lg">
          Build your professional reputation. Access better opportunities.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Individual Worker */}
        <Link href="/join/worker" className="group">
          <div className="bg-white rounded-2xl border border-gray-100 p-7 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
              <User className="w-7 h-7 text-blue-700" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">I'm an Individual Worker</h2>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Electrician, plumber, security guard, cleaner, or any skilled professional. Register yourself and build your trust profile.
            </p>
            <ul className="space-y-1.5 mb-6">
              {['Verify your identity', 'Showcase your skills', 'Get endorsed by employers', 'Access more work opportunities'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm group-hover:gap-3 transition-all">
              Register as Worker <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Organisation */}
        <Link href="/join/organisation" className="group">
          <div className="bg-white rounded-2xl border border-gray-100 p-7 hover:border-purple-200 hover:shadow-lg transition-all cursor-pointer">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-purple-100 transition-colors">
              <Building2 className="w-7 h-7 text-purple-700" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">I represent a Company</h2>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              A service company with multiple workers and branches. Register your organisation and deploy your team professionally.
            </p>
            <ul className="space-y-1.5 mb-6">
              {['Register your company', 'Add branches and teams', 'Get institutional contracts', 'Build organisational trust score'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-purple-700 font-semibold text-sm group-hover:gap-3 transition-all">
              Register Organisation <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      <p className="text-center text-sm text-gray-400 mt-8">
        Already registered? <Link href="/login" className="text-blue-700 hover:underline">Sign in →</Link>
      </p>
    </div>
  )
}
