import { FC, forwardRef, ForwardRefRenderFunction, useImperativeHandle, useState } from 'react';

type ModalProps = {
  defaultOpen: boolean;
  timeElapsed: number;
}
    
export type ModalHandle = {
  open: () => void,
  close: () => void,
}

export const Modal: ForwardRefRenderFunction<ModalHandle, ModalProps> = ({ defaultOpen, timeElapsed }, ref) => {

  const [isOpen, setIsOpen] = useState(defaultOpen);

  const openModal = () => {
    setIsOpen(true);
  }

  const closeModal = () => {
    setIsOpen(false);
  }

  useImperativeHandle(ref, () => ({
    open: () => {
      openModal();
    },
    close: () => {
      closeModal();
    },
  }));


  if (!isOpen) {
    return <></>;
  } else {
    return (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-10"
          id="my-modal"
        >
          <div
            className="relative top-20 mx-auto p-5 border w-64 shadow-lg rounded-md bg-white"
          >
            <div className="mt-3 text-center">
              <div
                className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-pastel-pink/[.4]"
              >
                <svg
                  className="h-6 w-6 text-pastel-pink"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Congrats 🥂</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  You solved the puzzle in {(timeElapsed / 1000).toFixed(2)} seconds
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  onClick={closeModal}
                  className="px-4 py-2 bg-pastel-pink text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-pastel-pink/[.4] focus:outline-none"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
    );
  }
};

export default forwardRef(Modal);