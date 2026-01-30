import { ref, shallowRef } from 'vue';
import { tryOnUnmounted, useEventBus } from '@vueuse/core';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getAuthorization } from '@/service/request/shared';
type SseStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';
const bus = useEventBus<string>('event-source');
export function useSse() {
  const status = ref<SseStatus>('idle');
  const error = shallowRef<unknown>(null);

  let ctrl: AbortController | null = null;

  const stop = () => {
    ctrl?.abort();
    ctrl = null;
    status.value = 'closed';
  };

  const start = async () => {
    if (typeof window === 'undefined') return;
    // 防止重复连接
    stop();
    status.value = 'connecting';
    error.value = null;
    ctrl = new AbortController();
    try {
      await fetchEventSource(`${import.meta.env.VITE_SSE_BASE_URL}/event-source`, {
        method: 'GET',
        headers: {
          Authorization: getAuthorization() as string
        },
        signal: ctrl.signal,
        openWhenHidden: false,
        async onopen() {
          status.value = 'open';
        },
        onmessage(msg) {
          bus.emit(msg.data);
        },
        onclose() {
          status.value = 'closed';
        },
        onerror(err) {
          status.value = 'error';
          error.value = err;
          //   console.error('SSE: 连接错误', err);
        }
      });
    } catch (e) {
      //   console.error('SSE: 连接错误', e);
      error.value = e;
      if (ctrl?.signal.aborted) status.value = 'closed';
      else status.value = 'error';
    }
  };

  tryOnUnmounted(stop);

  return { status, error, start, stop };
}
