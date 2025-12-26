import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserCheck, Briefcase } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
export default function RoleSelection() {
  const { updateRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async () => {
    if (!selectedRole) return toast.error('Select a role');
    setLoading(true);
    await updateRole(selectedRole);
    navigate('/dashboard');
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="card bg-base-200 shadow-2xl w-full max-w-2xl">
        <div className="card-body">
          <h2 className="card-title text-3xl justify-center mb-6">Select Your Role</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div onClick={() => setSelectedRole('applicant')} className={`card bg-base-100 shadow cursor-pointer hover:scale-105 ${selectedRole === 'applicant' ? 'ring-4 ring-primary' : ''}`}>
              <div className="card-body items-center text-center">
                <UserCheck className="w-16 h-16 mb-4 text-primary" />
                <h3 className="card-title">Applicant</h3>
                <p className="text-sm">Join interview rooms and code in real-time</p>
              </div>
            </div>
            <div onClick={() => setSelectedRole('interviewer')} className={`card bg-base-100 shadow cursor-pointer hover:scale-105 ${selectedRole === 'interviewer' ? 'ring-4 ring-secondary' : ''}`}>
              <div className="card-body items-center text-center">
                <Briefcase className="w-16 h-16 mb-4 text-secondary" />
                <h3 className="card-title">Interviewer</h3>
                <p className="text-sm">Create rooms and conduct interviews</p>
              </div>
            </div>
          </div>
          <div className="card-actions justify-center mt-8">
            <Button variant="primary" size="lg" onClick={handleSubmit} loading={loading} disabled={!selectedRole}>Continue</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
