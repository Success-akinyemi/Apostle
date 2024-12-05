
function Button({ text, onClick, style }) {
  return (
    <button onClick={onClick} className={`w-full pad1 bg-primary-color text-white flex items-center justify-center rounded-[8px] hover:bg-primary-hover text-[17px] font-medium ${style}`}>
      {text}
    </button>
  )
}

export default Button
