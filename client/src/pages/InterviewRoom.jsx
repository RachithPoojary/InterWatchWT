import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { roomsApi, executeApi, streamApi } from '../services/api';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  CallControls,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import Editor from '@monaco-editor/react';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { Play, Video, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatPanel from '../components/ChatPanel';

export default function InterviewRoom() {
  const { roomId } = useParams();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const { socket, emit, on, off, isConnected } = useSocket('/rooms');

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);

  const { isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => roomsApi.getById(roomId).then((res) => res.data.room),
    enabled: !!roomId,
  });

  // Initialize Stream Video
  useEffect(() => {
    const initStream = async () => {
      try {
        const tokenData = await streamApi.getToken().then((res) => res.data);
        const client = new StreamVideoClient({
          apiKey: tokenData.apiKey,
          user: { id: tokenData.userId, name: user?.fullName || 'User' },
          token: tokenData.token,
        });

        setStreamClient(client);
        const newCall = client.call('default', `room-${roomId}`);
        await newCall.join({ create: true });
        setCall(newCall);
      } catch (err) {
        console.error('Stream init error', err);
        toast.error('Failed to start video');
      }
    };

    if (user && roomId) {
      initStream();
    }

    return () => {
      if (call) call.leave();
      if (streamClient) streamClient.disconnectUser();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, roomId]);

  // Socket room join + sync
  useEffect(() => {
    if (!isConnected || !user) return;

    emit('join-room', {
      roomId: roomId.toUpperCase(),
      userId: user.id,
      userName: user.fullName || 'User',
    });

    on('room-joined', (data) => {
      setCode(data.code || '');
      setLanguage(data.language || 'javascript');
    });

    on('code-updated', (data) => setCode(data.code));
    on('language-updated', (data) => setLanguage(data.language));
    on('interview-ended', () => {
      toast.success('Interview ended');
      setTimeout(() => navigate('/dashboard'), 2000);
    });

    return () => {
      emit('leave-room');
      off('room-joined');
      off('code-updated');
      off('language-updated');
      off('interview-ended');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, user, roomId]);

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const result = await executeApi.runCode({ code, language });
      setOutput(
        result.data.output.stdout ||
          result.data.output.stderr ||
          'No output',
      );
      toast.success('Executed');
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setOutput(
          'You are sending execution requests too quickly. Please wait a few seconds and try again.',
        );
        toast.error('Rate limit reached. Slow down a bit.');
      } else {
        setOutput(err.message || 'Execution failed');
        toast.error('Failed');
      }
    }
    setIsExecuting(false);
  };

  if (isLoading) return <Loading fullscreen />;

  return (
    <div className="h-screen flex flex-col bg-base-100">
      <Navbar />

      {/* Header */}
      <div className="bg-base-200 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="badge badge-lg badge-primary">Room: {roomId}</div>
          <div className="badge badge-outline">{userRole}</div>
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="select select-sm select-bordered"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              emit('language-change', { roomId, language: e.target.value });
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <Button
            variant="error"
            size="sm"
            onClick={() => emit('end-interview', { roomId })}
          >
            <LogOut className="w-4 h-4" />
            End
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Video column */}
        <div className="bg-base-200 rounded-lg p-4 lg:col-span-1">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video
          </h3>
          <div className="bg-base-300 rounded-lg overflow-hidden flex flex-col h-full">
            {streamClient && call ? (
              <StreamVideo client={streamClient}>
                <StreamCall call={call}>
                  {/* Stack participants vertically – when 2 users are in the call,
                      both tiles will be visible one below the other */}
                  <div className="flex-1 w-full h-full">
                    <SpeakerLayout
                      layout="grid"
                      participantsBarPosition="hidden"
                      // orientation is supported in newer SDKs; if ignored,
                      // you still get both tiles visible in the grid.
                      orientation="vertical"
                    />
                  </div>
                  <div className="border-t border-base-200">
                    <CallControls />
                  </div>
                </StreamCall>
              </StreamVideo>
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
                <div className="avatar">
                  <div className="w-20 rounded-full bg-base-100 flex items-center justify-center text-3xl">
                    {user?.fullName?.[0] || 'U'}
                  </div>
                </div>
                <p className="text-sm text-base-content/70">
                  Waiting for other participant…
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Code editor */}
        <div className="lg:col-span-2 flex flex-col bg-base-200 rounded-lg">
          <div className="bg-base-300 px-4 py-2 flex justify-between items-center">
            <h3 className="font-semibold">Code Editor</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecute}
              loading={isExecuting}
            >
              <Play className="w-4 h-4" />
              Run
            </Button>
          </div>
          <Editor
            height="60%"
            language={language}
            value={code}
            onChange={(val) => {
              const newCode = val || '';
              setCode(newCode);
              emit('code-change', { roomId, code: newCode });
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              readOnly: userRole === 'interviewer',
            }}
          />
          <div className="bg-base-300 p-4">
            <h4 className="text-sm font-semibold mb-2">Output</h4>
            <pre className="text-xs bg-base-100 p-2 rounded">
              {output || 'No output'}
            </pre>
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-1 h-full">
          <ChatPanel
            socketApi={{ socket, emit, on, off }}
            roomId={roomId}
            currentUser={user}
          />
        </div>
      </div>
    </div>
  );
}
