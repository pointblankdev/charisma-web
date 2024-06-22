import { XIcon } from 'lucide-react';
import { CSSProperties, Dispatch, SetStateAction } from 'react';

export default function Modal({
  children,
  className,
  left = false,
  right = false,
  showCloseButton = true,
  show,
  setShow,
  dismissible = true,
  isYoutube = false,
  style
}: {
  children: React.ReactNode;
  className?: string;
  left?: boolean;
  right?: boolean;
  showCloseButton?: boolean;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  dismissible?: boolean;
  isYoutube?: boolean;
  style?: CSSProperties | undefined;
}) {
  return (
    <div
      className={`modal bg-[#000000]/50 ${show ? 'modal-open' : 'destroy-modal'}
                ${left ? 'items-start justify-start' : right ? 'items-start justify-end' : ''} ${
        dismissible ? 'cursor-pointer' : ''
      } ${isYoutube ? 'youtube-modal' : ''}
                `}
      onClick={e => {
        e.preventDefault();
        if (dismissible) {
          setShow(false);
        }
      }}
      style={style}
    >
      <div
        className={`${
          (left || right) && 'p-0'
        }  ${className} scrollbar-hide modal-box relative flex w-[fit-content] ${
          isYoutube ? '' : 'min-w-[400px]'
        } max-w-5xl justify-center bg-[#20242C]`}
        onClick={e => e.stopPropagation()}
      >
        <div>
          {showCloseButton && (
            <div
              onClick={() => {
                dismissible && setShow(false);
              }}
              className={`absolute z-[1] flex cursor-pointer items-center justify-center hover:brightness-75 ${
                left || right ? 'right-0' : 'right-2'
              } top-2`}
            >
              <XIcon className="h-4 w-4 text-[#7A869B]" strokeWidth={2.5} />
            </div>
          )}
          {children}
        </>
      </div>
    </div>
  );
}
