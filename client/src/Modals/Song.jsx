import { SlClose } from "react-icons/sl";
import LoadingBtn from "../Components/LoadingBtn";
import Button from "../Components/Button";
import { useEffect, useState } from "react";
import { useFetchCategories, useFetchSongs } from "../Helpers/fetch";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";
import { newSong, updateSong } from "../Helpers/apis";
import Spinner from "../Components/Spinner";

function Song({ setSelectedCard, closePopup, songId }) {
  const { isFetching: fetchingCategories, data: categoriesData } = useFetchCategories();
  const cat = categoriesData?.data;
  const { data: songsData, isFetching: fetchingSongs } = useFetchSongs(songId);
  const data = songsData?.data;


  const [formData, setFormData] = useState({ id: songId ? songId : '', category: [] });

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Handle Quill editors
  const handleDescription = (value) => setFormData({ ...formData, description: value });
  const handleLyrics = (value) => setFormData({ ...formData, lyrics: value });

  // Add a category
  const handleCategory = (e) => {
    const selectedCategory = e.target.value;
    if (
      selectedCategory !== "-- CATEGORY --" &&
      !formData.category.includes(selectedCategory)
    ) {
      setFormData({ ...formData, category: [...formData.category, selectedCategory] });
    }
  };

  // Remove a category
  const removeCategory = (categoryToRemove) => {
    setFormData({
      ...formData,
      category: formData.category.filter((cat) => cat !== categoryToRemove),
    });
  };

  useEffect(() => {
    console.log("DATA", formData);
  }, [formData]);

  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, key) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [key]: file,
      }));
    }
  };

  const handleNewSong = async () => {
    if(!formData?.title){
      toast.error('Provide a song title')
      return;
    }
    if(!formData?.author){
      toast.error('Provide song author')
      return;
    }
    if(!formData?.duration){
      toast.error('Provide a song duration')
      return;
    }
    if(formData?.category?.length < 1){
      toast.error('Provide at least one category')
      return;
    }
    if(!formData?.trackUrl){
      toast.error(`Provide a song track`)
      return;
    }
    if(!formData?.trackImg){
      toast.error(`Provide a song track cover image`)
      return;
    }
    try {
      setLoading(true);
      const res = await newSong(formData)
      if(res.success){
        toast.success(res.data)
        window.location.reload()
      } else {
        toast.error(res.data)
      }
    } catch (error) {
      console.error("Error saving song:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSong = async () => {
    try {
      setLoading(true);
      const res = await updateSong(formData)
      if(res.success){
        toast.success(res.data)
        window.location.reload()
      } else {
        toast.error(res.data)
      }
    } catch (error) {
      //console.error("Error saving song:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col gap-4 h-[70vh] overflow-y-auto scrollbar-thin">
      {/* TOP */}
      <div className="w-full flex items-center justify-between">
        <h2 className="h2">{ songId? 'Update' : ''} Song</h2>
        <div onClick={closePopup} className="">
          <SlClose className="text-[24px] font-semibold hover:text-error" />
        </div>
      </div>

      {/* BODY */}
      {
        fetchingSongs ? (
          <div className="flex items-center justify-center mt-2 mb-4">
            <Spinner style={`!text-[40px]`} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 w-full mt-8">
            <div className="inputGroup">
              <label className="label">Music Title</label>
              <input
                type="text"
                id="title"
                onChange={handleChange}
                placeholder="Music Title"
                className="input"
                defaultValue={data?.title}
              />
            </div>

            <div className="inputGroup">
              <label className="label">Music Author</label>
              <input
                type="text"
                id="author"
                onChange={handleChange}
                placeholder="Music Author"
                className="input"
                defaultValue={data?.author}
              />
            </div>

            <div className="inputGroup">
              <label className="label">Description</label>
              <ReactQuill
                value={formData.description}
                onChange={handleDescription}
                placeholder="Description of music"
                theme="snow"
                className="w-full h-[200px] mb-6"
                defaultValue={data?.description}
                dangerouslySetInnerHTML={{ __html: data?.description }}
              />
            </div>

            <div className="inputGroup">
              <label className="label">Duration</label>
              <input
                type="text"
                id="duration"
                onChange={handleChange}
                placeholder="Enter Duration E.g: 3:50"
                className="input"
                defaultValue={data?.duration}
              />
            </div>

            <div className="inputGroup">
      <label className="label">Upload Preview Music</label>
      <input
        type="file"
        id="previewUrl"
        accept="audio/*"
        onChange={(e) => handleFileChange(e, "previewUrl")}
        className="input"
      />
    </div>

    <div className="inputGroup">
      <label className="label">Upload Music Track</label>
      <input
        type="file"
        id="trackUrl"
        accept="audio/*"
        onChange={(e) => handleFileChange(e, "trackUrl")}
        className="input"
      />
    </div>

    <div className="inputGroup">
      <label className="label">Upload Track Image</label>
      <input
        type="file"
        id="trackImg"
        accept="image/*"
        onChange={(e) => handleFileChange(e, "trackImg")}
        className="input"
      />
    </div>


            <div className="inputGroup">
              <label className="label">Select Category</label>
              <select onChange={handleCategory} id="category" className="input">
                <option>-- CATEGORY --</option>
                {cat?.map((i, idx) => (
                  <option key={idx} value={i?.name}>
                    {i?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Selected Categories */}
            <div className="w-full flex flex-wrap gap-2">
              {formData.category.map((cat, idx) => (
                <span
                  key={idx}
                  className="bg-mainColor1 text-sm px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {cat}
                  <button
                    onClick={() => removeCategory(cat)}
                    className="text-error text-[19px] cursor-pointer "
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="inputGroup">
              <label className="label">Lyrics</label>
              <ReactQuill
                value={formData.lyrics}
                onChange={handleLyrics}
                placeholder="Enter Music Lyrics"
                theme="snow"
                className="w-full h-[200px] mb-6"
              />
            </div>

            {loading ? (
              <LoadingBtn />
            ) : (
              <Button onClick={songId && data ? handleUpdateSong : handleNewSong} text={"Save"} />
            )}
          </div>
        )
      }
    </div>
  );
}

export default Song;
