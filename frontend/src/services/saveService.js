// Simple localStorage-based save system
// Provides quick save/load under a single slot for now.

const QS_KEY = 'ai_dm_v2_quicksave';
const QS_TIME_KEY = 'ai_dm_v2_quicksave_time';

export const saveService = {
  save(data) {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(QS_KEY, json);
      localStorage.setItem(QS_TIME_KEY, String(Date.now()));
      return { success: true };
    } catch (e) {
      console.error('Save failed:', e);
      return { success: false, error: e?.message || 'Save failed' };
    }
  },
  load() {
    try {
      const json = localStorage.getItem(QS_KEY);
      if (!json) return { success: false, error: 'No quicksave found', data: null };
      const data = JSON.parse(json);
      return { success: true, data };
    } catch (e) {
      console.error('Load failed:', e);
      return { success: false, error: e?.message || 'Load failed', data: null };
    }
  },
  info() {
    const ts = localStorage.getItem(QS_TIME_KEY);
    return ts ? new Date(Number(ts)) : null;
  },
  clear() {
    localStorage.removeItem(QS_KEY);
    localStorage.removeItem(QS_TIME_KEY);
  }
};
