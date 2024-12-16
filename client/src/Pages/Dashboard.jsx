import { useNavigate } from "react-router-dom"
import Button from "../Components/Button"
import CategoryList from "../Components/CategoryList"
import Navbar from "../Components/Navbar"
import SongList from "../Components/SongList"
import { useFetchCategories, useFetchSongs } from "../Helpers/fetch"

function Dashboard({ setSelectedCard, setCategoryId, setSongId }) {
    const navigate = useNavigate()
    //top recent songs
    const { data: songsData, isFetching: fetchingSongs } = useFetchSongs();
    const data = songsData?.data?.splice(0, 10);
    //top recent categories
    const { isFetching: fetchingCategories, data: categoriesData } = useFetchCategories();
    const cat = categoriesData?.data?.splice(0, 10);

    const handleSong = () => {
        navigate('/songs')
    }

    const handleCategory = () => {
        navigate('/category')
    }

    return (
    <div className="flex flex-col">
      <Navbar />
    
        <div className="flex flex-col pad2 mt-[70px]">
            {/**BTN */}
            <div className="ml-auto mt-[10px] flex items-center gap-3">
                <div className="flex">
                    <Button onClick={handleSong} text={'Songs'} />
                </div>
                <div className="flex">
                    <Button onClick={handleCategory} text={'Category'} />
                </div>
            </div>
            
            {/**BODY */}
            <div className="flex mt-12 items-center gap-12 justify-between small-pc:flex-col">
                <div className="flex flex-[7] w-full">
                    <SongList data={data} loading={fetchingSongs} setSongId={setSongId} setSelectedCard={setSelectedCard} />
                </div>

                <div className="flex flex-[3] w-full">
                    <CategoryList data={cat} loading={fetchingCategories} setSelectedCard={setSelectedCard} setCategoryId={setCategoryId} />
                </div>
            </div>
        </div>
    </div>
  )
}

export default Dashboard
