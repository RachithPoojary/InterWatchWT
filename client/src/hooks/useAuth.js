import { useUser, useClerk } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
export const useAuth = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: dbUser } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => authApi.getMe().then(res => res.data.user),
    enabled: isSignedIn && !!user?.id,
  });
  const syncUserMutation = useMutation({
    mutationFn: authApi.syncUser,
    onSuccess: () => { queryClient.invalidateQueries(['user']); toast.success('Profile updated'); },
  });
  const updateRole = async (role) => {
  if (!user) return false;

  try {
    // Store role in unsafeMetadata (supported on /me)
    await user.update({
      unsafeMetadata: {
        ...(user.unsafeMetadata || {}),
        role,
      },
    });

    await syncUserMutation.mutateAsync({
      role,
      name: user.fullName || user.firstName,
      email: user.primaryEmailAddress?.emailAddress,
      profileImage: user.imageUrl,
    });

    return true;
  } catch (error) {
    console.error('updateRole error', error);
    toast.error('Failed to update role');
    return false;
  }
};

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
    navigate('/');
  };
  return { user, dbUser, userRole: user?.publicMetadata?.role, isLoaded, isSignedIn, updateRole, signOut: handleSignOut };
};
