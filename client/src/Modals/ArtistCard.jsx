import { useEffect, useState } from "react";
import { SlClose } from "react-icons/sl";
import { newArtist, newCategory, updateArtist, updateCategory } from "../Helpers/apis";
import toast from "react-hot-toast";
import LoadingBtn from "../Components/LoadingBtn";
import Button from "../Components/Button";
import { useFetchMyArtist } from "../Helpers/fetch";
import Spinner from "../Components/Spinner";

function ArtistCard({ setSelectedCard, artistId, closePopup }) {
    const { isFetching: fetchingArtist, data: artistData } = useFetchMyArtist(artistId);
    const cat = artistData?.data;

    const [ formData, setFormData ] = useState({ artistId: artistId ? artistId : '' })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleFileChange = (e, key) => {
        const file = e.target.files[0]; // Get the selected file
        if (file) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [key]: file,
          }));
        }
    };
    
    const [ loading, setLoading ] = useState(false)
    const handleArtist = async () => {
        try {
            setLoading(true)
            const res = artistId ? await updateArtist(formData) : await newArtist(formData)
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
    useEffect(() => {console.log('object', formData)}, [formData])
    
  return (
    <div className="flex items-center flex-col gap-4 h-[50vh] overflow-y-auto">
        {/**TOP */}
        <div className="w-full flex items-center justify-between">
            <h2 className="h2">{ artistId ? 'Update' : '' } Artist Profile</h2>
            <div onClick={closePopup} className="">
                <SlClose className="text-[24px] font-semibold hover:text-error" />
            </div>
        </div>
        {/**BODY */}
        <div className="flex flex-col items-center gap-8 w-full mt-8">
            {
                !fetchingArtist ? (
                    <>
                        <div className="inputGroup">
                            <label className="label">Artist name</label>
                            <input type="text" id="name" onChange={handleChange} defaultValue={`${artistId ? cat?.name : ''}`} placeholder="Enter Artist name" className="input" />
                        </div>

                        <div className="inputGroup">
                            <label className="label">About Artist</label>
                            <textarea onChange={handleChange} defaultValue={`${artistId ? cat?.about : ''}`} placeholder="About Artist" id="about" className="input resize-none h-[60px]"></textarea>
                        </div>

                        <div className="inputGroup">
                            <label className="label">Description</label>
                            <textarea onChange={handleChange} defaultValue={`${artistId ? cat?.description : ''}`} placeholder="About Artist" id="description" className="input resize-none h-[60px]"></textarea>
                        </div>

                        <div className="inputGroup">
                            <label className="label">Upload Artist Image</label>
                            <input
                                type="file"
                                id="profileImg"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "profileImg")}
                                className="input"
                            />
                        </div>
                    
                    </>
                ) : (
                    <div className="flex items-center justify-center mt-2 mb-4">
                      <Spinner style={`!text-[40px]`} />
                    </div>
                )
            }

            {
                loading ? (
                    <LoadingBtn />
                ) : (
                    <Button onClick={handleArtist} text={'Save'} />
                )
            }
        </div>
    </div>
  )
}

export default ArtistCard
