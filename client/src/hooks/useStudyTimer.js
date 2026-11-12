import { useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const PING_MS = 30000;

/** Öğrenci bu sayfadayken (sekme görünürken) çalışma süresini sunucuya bildirir; veli panelindeki günlük süre buradan gelir. */
export default function useStudyTimer(active = true) {
  const { user } = useAuth();
  const on = active && user?.role === 'student';
  useEffect(() => {
    if (!on) return undefined;
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') api.post('/progress/heartbeat').catch(() => {});
    }, PING_MS);
    return () => clearInterval(t);
  }, [on]);
}
