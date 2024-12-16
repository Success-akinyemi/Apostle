import { FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import Spinner from "./Spinner";
import toast from "react-hot-toast";
import { deleteSong } from "../Helpers/apis";
import { useState } from "react";

function SongList({ data, loading: loadingData, setSelectedCard, setSongId }) {

  const [loading, setLoading] = useState(false);
  const handleDelete = async (id) => {
    if (loading) {
      return;
    }
    const confirm = window.confirm(
      "Are you sure you want to delete this song"
    );
    if (confirm) {
      try {
        setLoading(true);
        const res = await deleteSong({ id: id });
        if (res.success) {
          toast.success(res.data);
          window.location.reload();
        } else {
          toast.error(res.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateSongs = (id) => {
    setSongId(id);
    setSelectedCard("song");
  };

  function truncateText(text, maxLength, ellipsis = true) {
    if (text.length <= maxLength) return text; 
    return text.slice(0, maxLength) + (ellipsis ? '...' : '');
  }

  return (
    <div className="w-full rounded-[8px] overflow-hidden max-h-[100vh] border-[3px] border-primary-color">
      {/* Header */}
      <div className="flex w-full p-3 bg-primary-color">
        <h2 className="h2 text-white">Song List</h2>
      </div>

      <div className="overflow-auto h-full px-3 py-2 max-h-[100vh]">
        {loadingData ? (
          <div className="flex items-center justify-center mt-2 mb-4">
            <Spinner style={`!text-[40px]`} />
          </div>
        ) : (
          // Render Songs

          <div>
            {/**Song details */}
            <div className="flex items-center gap-3">
              <table className="w-full tablet:overflow-x-auto">
                <thead className="w-full">
                  <tr className="w-full tablet:px-4 flex items-center justify-between">
                    <th className="flex flex-1 text-center">Title</th>
                    <th className="flex flex-1 text-center tablet:hidden">Author</th>
                    <th className="flex flex-1 text-center tablet:hidden">ID</th>
                    <th className="flex flex-1 text-center">Audio</th>
                    <th className="flex flex-1 text-end justify-end">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {data?.map((i, index) => (
                    <tr
                      key={index}
                      className={`flex items-center justify-between py-2 gap-3 border-b-[1px] tablet:px-3 ${
                        index === data.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="flex flex-1 text-center tablet:text-[14px]">{truncateText(i?.title, 20)}</td>
                      <td className="flex flex-1 text-center tablet:hidden">{truncateText(i?.author, 15)}</td>
                      <td className="flex flex-1 text-center tablet:hidden">{i.trackId}</td>
                      <td className="flex flex-1 text-center">
                        <audio controls src={i.trackUrl} />
                      </td>
                      <td className="flex flex-1 text-end justify-end">
                        <div className="flex items-center gap-[5px]">
                          <div
                            onClick={() => handleUpdateSongs(i?.trackId)}
                            className="cursor-pointer"
                          >
                            <FaEdit className="text-[20px] text-success" />
                          </div>
                          <div
                            onClick={() => handleDelete(i?.trackId)}
                            className="cursor-pointer"
                          >
                            <AiFillDelete className="text-[20px] text-error" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SongList;
