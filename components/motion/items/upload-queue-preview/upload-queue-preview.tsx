import type { CSSProperties } from 'react';
import './upload-queue-preview.css';

export type UploadStatus =
  'queued' | 'uploading' | 'completed' | 'failed' | 'canceled';

export interface UploadItem {
  id: string;
  name: string;
  size: string;
  status: UploadStatus;
  /** 0–1 */
  progress: number;
  error?: string;
}

export interface UploadQueueProps {
  items: UploadItem[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  className?: string;
}

const STATUS_TEXT: Record<UploadStatus, string> = {
  queued: 'Waiting',
  uploading: 'Uploading',
  completed: 'Done',
  failed: 'Failed',
  canceled: 'Canceled',
};

/**
 * A list of files moving through queued, uploading, done, failed or
 * canceled. Each state has its own icon shape and words, not only a color.
 * The component only draws; you own the uploads and pass in their state.
 */
export function UploadQueue({
  items,
  onCancel,
  onRetry,
  className = '',
}: UploadQueueProps) {
  return (
    <ul className={`mg-uploads ${className}`} aria-label='Uploads'>
      {items.map((item) => {
        const pct = Math.round(item.progress * 100);
        const busy = item.status === 'queued' || item.status === 'uploading';
        return (
          <li
            key={item.id}
            className='mg-uploads__item'
            data-status={item.status}
          >
            <span className='mg-uploads__icon' aria-hidden='true' />
            <div className='mg-uploads__body'>
              <div className='mg-uploads__row'>
                <strong>{item.name}</strong>
                <span>{item.size}</span>
              </div>
              <div
                className='mg-uploads__bar'
                role='progressbar'
                aria-label={`${item.name} upload`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                style={{ '--mg-progress': item.progress } as CSSProperties}
              >
                <span />
              </div>
              <span className='mg-uploads__state'>
                {STATUS_TEXT[item.status]}
                {item.status === 'uploading' ? ` · ${pct}%` : ''}
                {item.status === 'failed' && item.error
                  ? ` · ${item.error}`
                  : ''}
              </span>
            </div>
            {busy ? (
              <button
                type='button'
                onClick={() => onCancel(item.id)}
                aria-label={`Cancel ${item.name}`}
              >
                Cancel
              </button>
            ) : item.status === 'failed' || item.status === 'canceled' ? (
              <button
                type='button'
                onClick={() => onRetry(item.id)}
                aria-label={`Retry ${item.name}`}
              >
                Retry
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
