'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import './chat-typing-relay.css';

export interface ChatMessage {
  id: number;
  from: string;
  text: string;
  mine?: boolean;
}

export interface ChatTypingRelayProps {
  messages: ChatMessage[];
  /** Who is typing right now, if anyone. */
  typing: string | null;
  label: string;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * A chat transcript: a typing indicator bubbles in, is replaced by the
 * message, and the next speaker's indicator follows. The transcript is a
 * plain ordered list, so it reads well without the animation.
 */
export function ChatTypingRelay({
  messages,
  typing,
  label,
  className = '',
}: ChatTypingRelayProps) {
  const list = useRef<HTMLOListElement>(null);
  useIsomorphicLayoutEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, typing]);

  return (
    <div className={`mg-chat ${className}`}>
      <ol ref={list} className='mg-chat__list' aria-label={label} tabIndex={0}>
        {messages.map((m) => (
          <li key={m.id} className='mg-chat__msg' data-mine={Boolean(m.mine)}>
            <span className='mg-chat__from'>{m.from}</span>
            <span className='mg-chat__bubble'>{m.text}</span>
          </li>
        ))}
        {typing ? (
          <li
            className='mg-chat__msg mg-chat__msg--typing'
            aria-label={`${typing} is typing`}
          >
            <span className='mg-chat__from'>{typing}</span>
            <span className='mg-chat__bubble' aria-hidden='true'>
              <i />
              <i />
              <i />
            </span>
          </li>
        ) : null}
      </ol>
      <p className='mg-chat__sr' aria-live='polite'>
        {typing
          ? `${typing} is typing`
          : messages.length
            ? `${messages[messages.length - 1].from}: ${messages[messages.length - 1].text}`
            : ''}
      </p>
    </div>
  );
}
