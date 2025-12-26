import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { roomsApi } from '../services/api';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import { DoorOpen } from 'lucide-react';
import toast from 'react-hot-toast';
export default function RoomJoin() {
  const { roomId: urlRoomId } = useParams();
  const [roomCode, setRoomCode] = useState(urlRoomId?.toUpperCase() || '');
  const navigate = useNavigate();
  const joinMutation = useMutation({
    mutationFn: (roomId) => roomsApi.join(roomId),
    onSuccess: (res) => { toast.success('Joined!'); navigate(`/room/${res.data.room.roomId}`); },
    onError: (err) => toast.error(err.message),
  });
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-3xl justify-center mb-4"><DoorOpen className="w-8 h-8 mr-2" />Join Room</h2>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Room Code</span></label>
              <input type="text" placeholder="6-character code" className="input input-bordered input-lg text-center text-2xl uppercase" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} maxLength={6} autoFocus />
            </div>
            <Button variant="primary" size="lg" onClick={() => joinMutation.mutate(roomCode)} loading={joinMutation.isPending} disabled={roomCode.length !== 6} className="w-full mt-6">Join Room</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
