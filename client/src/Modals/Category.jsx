import { useState } from "react";
import { SlClose } from "react-icons/sl";
import { newCategory, updateCategory } from "../Helpers/apis";
import toast from "react-hot-toast";
import LoadingBtn from "../Components/LoadingBtn";
import Button from "../Components/Button";

function Category({ setSelectedCard, categoryId, closePopup }) {
    const [ formData, setFormData ] = useState({ id: categoryId ? categoryId : '' })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }
    
    const [ loading, setLoading ] = useState(false)
    const handleCategory = async () => {
        try {
            setLoading(true)
            const res = categoryId ? await updateCategory(formData) : await newCategory(formData)
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
    
  return (
    <div className="flex items-center flex-col gap-4">
        {/**TOP */}
        <div className="w-full flex items-center justify-between">
            <h2 className="h2">Music Category</h2>
            <div onClick={closePopup} className="">
                <SlClose className="text-[24px] font-semibold hover:text-error" />
            </div>
        </div>
        {/**BODY */}
        <div className="flex flex-col items-center gap-8 w-full mt-8">
            <div className="inputGroup">
                <label className="label">Category name</label>
                <input type="text" id="name" onChange={handleChange} placeholder="Enter category name" className="input" />
            </div>

            {
                loading ? (
                    <LoadingBtn />
                ) : (
                    <Button onClick={handleCategory} text={'Save'} />
                )
            }
        </div>
    </div>
  )
}

export default Category
