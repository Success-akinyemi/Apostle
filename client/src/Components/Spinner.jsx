import { FaSpinner } from "react-icons/fa"

function Spinner({ style }) {
  return (
    <FaSpinner className={`animate-spin mr-2 text-[20px] ${style}`} />
  )
}

export default Spinner
