import { useNavigate } from "react-router-dom"
import Button from "../Components/Button"
import Navbar from "../Components/Navbar"
import SongList from "../Components/SongList"
import { useFetchSongs } from "../Helpers/fetch"

function Songs({ setSelectedCard, setCategoryId, setSongId }) {
    const navigate = useNavigate()
    const { data: songsData, isFetching: fetchingSongs } = useFetchSongs();
    const data = songsData?.data;

    const handleHome = () => {
        navigate('/dashboard')
    }
  return (
    <div className="flex flex-col">
      <Navbar />
    
        <div className="flex flex-col pad2 mt-[70px]">
            {/**BTN */}
            <div className="ml-auto mt-[10px] flex items-center gap-3">
                <div className="flex">
                    <Button onClick={handleHome} text={'Dashboard'} style={`!phone:text-[9px]`} />
                </div>
                <div className="flex">
                    <Button onClick={() => setSelectedCard('song')} text={'New Song'} style={`!phone:text-[9px]`} />
                </div>
                {/**
                 * 
                <div className="flex">
                    <Button onClick={() => setSelectedCard('category')} text={'Category'} />
                </div>
                 */}
            </div>
            
            {/**BODY */}
            <div className="flex mt-12 items-center gap-12 justify-between">
                <div className="flex flex-[7] w-full mb-8">
                    <SongList data={data} loading={fetchingSongs} setSongId={setSongId} setSelectedCard={setSelectedCard} />
                </div>
            </div>
        </div>
    </div>
  )
}

export default Songs
