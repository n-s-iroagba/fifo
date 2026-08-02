'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const VAPID_PUBLIC_KEY = 'BLX7h2AF-MbwFRRtf-YSBgLQ8FFOj7eiV6cP7HQicE0BvBFzfrFBzrjgXbAtfymNx53z4OT0R820HaZJvMCieVE';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushNotificationManager() {
    const { user } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check existing subscription on mount
    useEffect(() => {
        if (typeof window === 'undefined' || !user) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        // Check if already subscribed
        if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready
                .then(reg => reg.pushManager.getSubscription())
                .then(sub => {
                    if (sub) setIsSubscribed(true);
                })
                .catch(() => {});
        } else {
            // Register SW early to be ready when user clicks
            navigator.serviceWorker.register('/sw.js').catch(err => console.error('[Push] SW Registration failed:', err));
        }
    }, [user]);

    const subscribeToPush = async () => {
        setIsLoading(true);

        try {
            // Step 1: Request browser permission — this triggers the native dialog
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setIsSubscribed(true); // User denied — hide the prompt
                return;
            }

            // Step 2: Ensure service worker is registered
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                alert('Push notifications are not supported in this browser.');
                setIsSubscribed(true);
                return;
            }

            // Register the service worker explicitly if not already active
            let reg = await navigator.serviceWorker.getRegistration();
            if (!reg) {
                reg = await navigator.serviceWorker.register('/sw.js');
            }

            // Wait for it to be ready with a timeout to avoid infinite "activating..."
            const readyPromise = navigator.serviceWorker.ready;
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Service Worker activation timeout')), 10000)
            );

            reg = await Promise.race([readyPromise, timeoutPromise]) as ServiceWorkerRegistration;

            // Step 4: Subscribe to push
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Step 5: Send subscription to server
            await api.post('/notifications/subscribe', sub.toJSON());
            setIsSubscribed(true);
        } catch (error) {
            console.error('[Push] Subscription failed:', error);
            // Fail silently and hide the prompt to avoid annoying the user
            setIsSubscribed(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || isSubscribed) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-blue-900/20 border border-blue-50 max-w-sm flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined">notifications_active</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-tight text-blue-900">Enable Push Alerts</h4>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Get real-time updates on your applications and job matches.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={subscribeToPush}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-blue-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Activating...' : 'Enable Now'}
                    </button>
                    <button
                        onClick={() => setIsSubscribed(true)}
                        className="px-6 py-3 bg-blue-50 text-blue-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    );
}
