export default function Accordion({ title, isOpen, onClick, children }) {
  return (
    <div className='border rounded-lg overflow-hidden'>
      <button
        onClick={onClick}
        className='w-full flex justify-between items-center px-5 py-4 text-left font-medium text-slate-700'
      >
        {title}
        <span
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ⌄
        </span>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className='px-5 pb-5'>{children}</div>
      </div>
    </div>
  );
}
