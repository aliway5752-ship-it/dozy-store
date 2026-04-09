import { User } from '@/types';

type UserProfileData = User;

export const fetchUser = async (): Promise<UserProfileData | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_URL}/api/user`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const updateUser = async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    address?: string;
    addressId?: string;
    profileImageUrl?: string | null;
}): Promise<void> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_URL}/api/user`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
