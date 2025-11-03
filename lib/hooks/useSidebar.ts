import { useCallback } from 'react';

export function useSidebar() {
  const toggleSidebar = useCallback(() => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar?.classList.contains('-translate-x-full')) {
      sidebar.classList.remove('-translate-x-full');
      overlay?.classList.remove('opacity-0', 'pointer-events-none');
    } else {
      sidebar?.classList.add('-translate-x-full');
      overlay?.classList.add('opacity-0', 'pointer-events-none');
    }
  }, []);

  const closeSidebar = useCallback(() => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar?.classList.add('-translate-x-full');
    overlay?.classList.add('opacity-0', 'pointer-events-none');
  }, []);

  return { toggleSidebar, closeSidebar };
}
