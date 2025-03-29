import React from 'react';
import { FaCircleInfo } from 'react-icons/fa6';

function InformationalModal({ infoSize, title, text, id }) {
    const modalId = `info_modal_${id}`;

    return (
        <div>
            <div 
                className="p-2 absolute top-3 right-3 text-primary/90 btn btn-ghost hover:bg-transparent hover:border-0 hover:scale-120 hover:shadow-none transition-transform duration-200" 
                onClick={(e) => {
                    e.stopPropagation(); 
                    document.getElementById(modalId).showModal();
                }}
            >
                <FaCircleInfo size={infoSize} />
            </div>
            <dialog id={modalId} className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-primary">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="py-4">{text}</p>
                </div>
            </dialog>
        </div>
    )
}

export default InformationalModal;