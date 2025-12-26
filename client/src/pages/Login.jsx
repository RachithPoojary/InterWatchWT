import { SignIn, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Code2, Video, Terminal } from 'lucide-react';
export default function Login() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (isSignedIn && user) {
      navigate(user.publicMetadata?.role ? '/dashboard' : '/role-select');
    }
  }, [isSignedIn, user, navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Interview Platform</h1>
            <p className="text-xl">Real-time video, collaborative coding, and chat</p>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-base-200 rounded-lg"><Video className="w-8 h-8 text-primary" /><div><h3 className="font-semibold">HD Video Calls</h3></div></div>
              <div className="flex gap-4 p-4 bg-base-200 rounded-lg"><Terminal className="w-8 h-8 text-secondary" /><div><h3 className="font-semibold">Live Code Editor</h3></div></div>
            </div>
          </div>
          <div className="flex justify-center"><SignIn routing="path" path="/" afterSignInUrl="/dashboard" /></div>
        </div>
      </div>
    </div>
  );
}
