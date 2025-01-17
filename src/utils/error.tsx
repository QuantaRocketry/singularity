export default function ErrorProvider() {
  return (
    <dialog id="error-modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Error</h3>
        <p id="error-message" className="py-4">Press ESC key or click the button below to close</p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  )
}

export function showError(error: string) {
  (document.getElementById('error-message') as HTMLElement).innerText = error;
  (document.getElementById('error-modal') as HTMLDialogElement).showModal();
}