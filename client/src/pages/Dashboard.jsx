import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { roomsApi } from '../services/api';
import Navbar from '../components/ui/Navbar';
import Card, { CardBody, CardTitle, CardActions } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import { Plus, Users, Clock, Code } from 'lucide-react';
import toast from 'react-hot-toast';
export default function Dashboard() {
  const { userRole, dbUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [activeTab, setActiveTab] = useState('open');
  const { data: openRooms, isLoading: loadingOpen } = useQuery({ queryKey: ['rooms', 'open'], queryFn: () => roomsApi.getOpen().then(res => res.data.rooms), refetchInterval: 5000 });
  const { data: myRooms, isLoading: loadingMy } = useQuery({ queryKey: ['rooms', 'my'], queryFn: () => roomsApi.getMyRooms().then(res => res.data.rooms) });
  const createRoomMutation = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: (res) => { toast.success(`Room ${res.data.room.roomId} created!`); queryClient.invalidateQueries(['rooms']); setIsCreateModalOpen(false); navigate(`/room/${res.data.room.roomId}`); },
  });
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-base-content/70 mb-8">Welcome, {dbUser?.name || 'User'}!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat bg-base-200 rounded-lg shadow"><div className="stat-figure text-primary"><Users className="w-8 h-8" /></div><div className="stat-title">Active Rooms</div><div className="stat-value text-primary">{openRooms?.length || 0}</div></div>
          <div className="stat bg-base-200 rounded-lg shadow"><div className="stat-figure text-secondary"><Clock className="w-8 h-8" /></div><div className="stat-title">My Rooms</div><div className="stat-value text-secondary">{myRooms?.length || 0}</div></div>
          <div className="stat bg-base-200 rounded-lg shadow"><div className="stat-figure text-accent"><Code className="w-8 h-8" /></div><div className="stat-title">Role</div><div className="stat-value text-accent capitalize">{userRole}</div></div>
        </div>
        <Button variant="primary" size="lg" onClick={() => setIsCreateModalOpen(true)} className="gap-2 mb-6"><Plus className="w-5 h-5" />Create Room</Button>
        <div className="tabs tabs-boxed bg-base-200 mb-6">
          <a className={`tab ${activeTab === 'open' ? 'tab-active' : ''}`} onClick={() => setActiveTab('open')}>Open Rooms</a>
          <a className={`tab ${activeTab === 'my' ? 'tab-active' : ''}`} onClick={() => setActiveTab('my')}>My Rooms</a>
        </div>
        {activeTab === 'open' && (loadingOpen ? <Loading /> : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{openRooms?.map((room) => (
          <Card key={room.id} hover><CardBody><CardTitle>Room {room.roomId}</CardTitle><div className="badge badge-primary">{room.language}</div><CardActions><Button variant="primary" size="sm" onClick={() => navigate(`/join/${room.roomId}`)}>Join</Button></CardActions></CardBody></Card>
        ))}</div>)}
        {activeTab === 'my' && (loadingMy ? <Loading /> : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{myRooms?.map((room) => (
          <Card key={room.id} hover><CardBody><CardTitle>Room {room.roomId}</CardTitle><div className="badge badge-primary">{room.language}</div><div className="badge">{room.status}</div><CardActions><Button variant="outline" size="sm" onClick={() => navigate(`/room/${room.roomId}`)}>View</Button></CardActions></CardBody></Card>
        ))}</div>)}
      </div>
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Room" actions={<><Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button variant="primary" onClick={() => createRoomMutation.mutate({ language: selectedLanguage })} loading={createRoomMutation.isPending}>Create</Button></>}>
        <select className="select select-bordered w-full" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}><option value="javascript">JavaScript</option><option value="python">Python</option><option value="java">Java</option></select>
      </Modal>
    </div>
  );
}
