import { FaSpinner } from "react-icons/fa";

function LoadingBtn({ style }) {
  return (
    <button
      className={`w-full pad1 bg-primary-color text-white flex items-center justify-center rounded-[8px] hover:bg-primary-hover text-[17px] font-medium ${style}`}
      disabled 
    >
        <FaSpinner className="animate-spin mr-2 text-[20px]" />
        Loading...
    </button>
  );
}

export default LoadingBtn;
