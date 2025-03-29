import { FaCircleInfo } from 'react-icons/fa6';

function InformationalModal() {

    return (
        <div>
            <div className="absolute top-5 right-5 text-primary/90 btn" onClick={() => document.getElementById('my_modal_3').showModal()}>
            <FaCircleInfo size={infoSize} />
            </div>
            <dialog id="my_modal_3" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Hello!</h3>
                    <p className="py-4">Press ESC key or click on ✕ button to close</p>
                </div>
            </dialog>
        </div>
    )
}

export default InformationalModal