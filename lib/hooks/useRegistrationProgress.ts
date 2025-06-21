'use client';

import { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

interface ProgressDoc {
  step?: string;
  message?: string;
}

export function useRegistrationProgress(uid: string | null | undefined) {
  const [progress, setProgress] = useState<ProgressDoc>({});

  useEffect(() => {
    if (!uid) return;
    const db = getFirestore();
    const ref = doc(db, 'registrationProgress', uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProgress(snap.data() as ProgressDoc);
      }
    });
    return unsub;
  }, [uid]);

  return progress;
} 