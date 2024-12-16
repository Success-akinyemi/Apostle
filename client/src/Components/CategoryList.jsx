import Spinner from "./Spinner";
import { FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import { useState } from "react";
import { deleteCategory } from "../Helpers/apis";
import toast from "react-hot-toast";

function CategoryList({ data: cat, loading: loadingData, setSelectedCard, setCategoryId }) {

  const [ loading, setLoading ] = useState(false)
  const handleDelete = async ( id ) => {
    if(loading){
      return
    }
    const confirm = window.confirm('Are you sure you want to delete this category')
    if(confirm){
      try {
        setLoading(true)
        const res = await deleteCategory({ id: id })
        if(res.success){
          toast.success(res.data)
          window.location.reload()
        } else {
          toast.error(res.data)
        }
      } catch (error) {
        
      } finally {
        setLoading(false)
      }
    }
  }

  const handleUpdateCategory = ( id ) => {
    setCategoryId(id)
    setSelectedCard('category')
  }

  return (
    <div className="w-full rounded-[8px] overflow-hidden max-h-[50vh] border-[3px] border-primary-color">
      {/* Header */}
      <div className="flex w-full p-3 bg-primary-color">
        <h2 className="h2 text-white">Categories</h2>
      </div>

      {/* List Container */}
      <div className="overflow-y-auto h-full px-3 py-2 max-h-[50vh]">
        {loadingData ? (
          <div className="flex items-center justify-center mt-2 mb-4">
            <Spinner style={`!text-[40px]`} />
          </div>
        ) : (
          // Render Categories
          cat?.map((i, index) => (
            <div
              key={index}
              className={`flex items-center justify-between py-2 border-b-[1px] ${
                index === cat.length - 1 ? "border-b-0" : ""
              }`}
            >
              <p>{i?.name}</p>

              <div className="flex items-center gap-[5px]">
                <div onClick={() => handleUpdateCategory(i?.slug)} className="cursor-pointer">
                    <FaEdit className="text-[20px] text-success" />
                </div>
                <div onClick={() => handleDelete(i?.slug)} className="cursor-pointer">
                    <AiFillDelete className="text-[20px] text-error" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CategoryList;
