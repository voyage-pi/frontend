import React from 'react';
import { FaCircleInfo } from 'react-icons/fa6';
import { createPortal } from 'react-dom';

function InformationalModal({ infoSize, title, text, id }) {
    const modalId = `info_modal_${id}`;
    const [isOpen, setIsOpen] = React.useState(false);

    const openModal = (e) => {
        e.stopPropagation();
        setIsOpen(true);
        document.getElementById(modalId).showModal();
    };

    const closeModal = () => {
        setIsOpen(false);
        document.getElementById(modalId).close();
    };

    return (
        <div>
            <div 
                className="p-2 absolute top-3 right-3 text-primary/90 btn btn-ghost hover:bg-transparent hover:border-0 hover:scale-110 hover:shadow-none transition-transform duration-200" 
                onClick={openModal}
            >
                <FaCircleInfo size={infoSize} />
            </div>
            {createPortal(
                <dialog 
                    id={modalId} 
                    className="modal" 
                    onClose={() => setIsOpen(false)}
                >
                    <div className="modal-box bg-white z-50">
                        <button 
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-primary"
                            onClick={closeModal}
                        >
                            ✕
                        </button>
                        <h3 className="font-bold text-xl">{title}</h3>
                        <p className="py-4 text-justify text-md">{text}</p>
                    </div>
                    <div className="modal-backdrop bg-black/50" onClick={closeModal}></div>
                </dialog>,
                document.body
            )}
        </div>
    );
}

export default InformationalModal;