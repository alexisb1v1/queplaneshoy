'use client';

import React, { useEffect, useState } from 'react';
import SettingsTab from '../../features/profile/ui/settings-tab';
import { getCurrentUserUseCase } from '../../features/auth';
import { UserModel } from '../../features/auth/models/user.model';

export default function ProfilePage() {
  const [user, setUser] = useState<UserModel | null>(null);

  useEffect(() => {
    getCurrentUserUseCase.execute().match(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        // Redirección manejada por ProfileLayout
      }
    );
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div>
      <SettingsTab 
        user={user} 
        onUserUpdate={(updatedUser) => {
          setUser(updatedUser);
        }} 
      />
    </div>
  );
}
